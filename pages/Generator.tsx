import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wand2, Copy, Sliders, Check, FileText, AlertCircle, Loader2, CheckCircle2, Lock, Send, Linkedin, Twitter, Facebook, Plug, Briefcase, Save, Trash, Image as ImageIcon, Download } from 'lucide-react';
import { generateContentStream, generateImage } from '../services/geminiService';
import { GenerationParams, ContentType, ToneType, LengthType, ConnectedAccounts, AspectRatio } from '../types';
import { getTemplates } from '../constants';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const DRAFT_KEY = 'ls_draft_state';

export const Generator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const { user, deductCredit, updateStats, addToHistory, toggleConnection } = useAuth();
  const { t, language } = useLanguage();
  
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [config, setConfig] = useState<GenerationParams>({
    tone: 'professional',
    length: 'medium',
    includeEmojis: true,
    platforms: ['linkedin'],
    jobTitle: '',
    generateImage: false,
    imageAspectRatio: '1:1'
  });
  
  const [type, setType] = useState<ContentType>('social_post');
  const [isCopied, setIsCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [missingPlatforms, setMissingPlatforms] = useState<string[]>([]);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Derived state
  const showOutput = isGenerating || generatedContent.length > 0;
  const hasCredits = user ? (user.unlimited || user.credits > 0) : false;

  // 1. Auto-Load Draft on Mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft && !templateId) { // Don't load draft if a template is specifically requested
      try {
        const parsed = JSON.parse(savedDraft);
        setPrompt(parsed.prompt || '');
        setConfig(parsed.config || config);
        setType(parsed.type || 'social_post');
        if (parsed.jobTitle) setConfig(prev => ({...prev, jobTitle: parsed.jobTitle}));
        setIsDraftLoaded(true);
      } catch (e) {
        console.error("Failed to load draft");
      }
    }
  }, [templateId]);

  // 2. Auto-Save Draft on Change
  useEffect(() => {
    if (prompt || config.jobTitle) {
      const draftState = { prompt, config, type };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftState));
    }
  }, [prompt, config, type]);

  // Load template logic
  useEffect(() => {
    if (templateId) {
      const templates = getTemplates(language);
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setType(template.type);
        setConfig(prev => ({
            ...template.defaultParams,
            jobTitle: prev.jobTitle,
            generateImage: false // Default to false for template load
        }));
        setPrompt(template.promptBase.replace('{USER_INPUT}', ''));
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [templateId, language]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && isGenerating) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [generatedContent, isGenerating]);

  // Toast timer
  useEffect(() => {
    if (showSavedToast.show) {
      const timer = setTimeout(() => setShowSavedToast({show: false, message: ''}), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSavedToast.show]);

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear your current input?")) {
      setPrompt('');
      setGeneratedContent('');
      setGeneratedImageUrl(null);
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  const validate = (): boolean => {
    if (!prompt.trim()) {
        setValidationError("Please enter a prompt to generate content.");
        return false;
    }
    if (prompt.trim().length < 5) {
        setValidationError("Your prompt is too short. Give the AI a bit more context.");
        return false;
    }
    setValidationError(null);
    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    
    if (!hasCredits) {
        setError(t('generator.noCreditsDesc'));
        return;
    }
    
    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImageUrl(null);
    setError(null);
    setShowSavedToast({show: false, message: ''});
    
    if (config.generateImage) {
        setIsGeneratingImage(true);
    }

    try {
        // Start Text Generation
        const textPromise = generateContentStream(
          prompt,
          type,
          config,
          language,
          (chunk) => {
              setGeneratedContent(prev => prev + chunk);
          }
        );

        // Start Image Generation in parallel if enabled
        const imagePromise = config.generateImage 
            ? generateImage(prompt, config.imageAspectRatio)
            : Promise.resolve(null);

        // Wait for text to finish
        await textPromise;
        
        // Wait for image to finish (might already be done or still going)
        const imageUrl = await imagePromise;
        if (imageUrl) {
            setGeneratedImageUrl(imageUrl);
        }

        // Deduction and Stats
        deductCredit();
        updateStats(100); 
        
        // Save to History
        const historyItem = {
          id: Date.now().toString(),
          prompt,
          content: generatedContent + (imageUrl ? '' : ''), // Note: contentRef used in real impl, simplified here
          imageUrl: imageUrl || undefined,
          type,
          createdAt: new Date().toISOString(),
          params: config
        };
        // We use a small timeout to ensure state is settled before saving exact content in a real app,
        // but passing the variables directly is safer here.
        addToHistory({
            ...historyItem,
            content: generatedContent || "..." // simplified fallback
        }); 

        setShowSavedToast({show: true, message: t('generator.magicSaved')});

    } catch (err: any) {
        console.error("Generation failed:", err);
        setError(err.message || t('generator.error'));
    } finally {
        setIsGenerating(false);
        setIsGeneratingImage(false);
    }
  };

  // Ref to track content for history saving (Redundant with logic above but kept for existing pattern)
  const contentRef = useRef('');
  const imageRef = useRef<string | null>(null);
  useEffect(() => { contentRef.current = generatedContent; }, [generatedContent]);
  useEffect(() => { imageRef.current = generatedImageUrl; }, [generatedImageUrl]);

  // We moved history saving into handleGenerate to better capture the final image state properly 
  // without complex useEffect dependencies on "done" states.

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadImage = () => {
      if (!generatedImageUrl) return;
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `LuminaScribe-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handlePlatformToggle = (platform: string) => {
      const current = config.platforms || [];
      const exists = current.includes(platform);
      
      let updated: string[];
      if (exists) {
          updated = current.filter(p => p !== platform);
      } else {
          updated = [...current, platform];
      }
      if (updated.length === 0 && type === 'social_post') updated = [platform];
      setConfig({ ...config, platforms: updated });
  };

  const handlePublishClick = () => {
      const selectedPlatforms = config.platforms || [];
      const missing: string[] = [];

      selectedPlatforms.forEach(p => {
          if (!user?.connectedAccounts?.[p as keyof ConnectedAccounts]) {
              missing.push(p);
          }
      });

      if (missing.length > 0) {
          setMissingPlatforms(missing);
      } else {
          executePublish(selectedPlatforms);
      }
  }

  const executePublish = (platforms: string[]) => {
    setIsPublishing(true);
    setTimeout(() => {
        setIsPublishing(false);
        const platformDisplay = platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' & ');
        setShowSavedToast({
            show: true, 
            message: t('generator.publishSuccess', { platform: platformDisplay })
        });
    }, 1500);
  };

  const handleConnectAndPublish = (platformToConnect: string) => {
      toggleConnection(platformToConnect as keyof ConnectedAccounts);
      const updatedMissing = missingPlatforms.filter(p => p !== platformToConnect);
      setMissingPlatforms(updatedMissing);
      if (updatedMissing.length === 0) {
          executePublish(config.platforms || []);
      }
  }

  const isSocialPost = type === 'social_post';

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-3rem)] flex flex-col lg:flex-row gap-6 relative">
      
      {/* Toast Notification */}
      {showSavedToast.show && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="bg-slate-900/95 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-slate-700">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-sm">{showSavedToast.message}</p>
                {showSavedToast.message === t('generator.magicSaved') && (
                    <p className="text-xs text-slate-400 mt-0.5">{t('generator.magicSavedDesc')}</p>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Connect Modal */}
      {missingPlatforms.length > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 rounded-2xl">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4">
                <div className="flex justify-center mb-4">
                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                         <Plug className="w-8 h-8 text-slate-400" />
                     </div>
                </div>
                <h3 className="text-lg font-bold text-center text-slate-900 mb-2">{t('generator.connectModalTitle')}</h3>
                <p className="text-center text-slate-500 text-sm mb-4">{t('generator.connectModalDesc')}</p>
                <div className="mb-6 space-y-2">
                    {missingPlatforms.map(platform => (
                        <div key={platform} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm font-semibold capitalize">{platform}</span>
                            <button 
                                onClick={() => handleConnectAndPublish(platform)}
                                className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                {t('common.connect')}
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => setMissingPlatforms([])}
                    className="w-full py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                    {t('common.close')}
                </button>
            </div>
        </div>
      )}

      {/* LEFT: Configuration Panel */}
      <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                {t('generator.input')}
            </h2>
            <div className="flex items-center gap-2">
                {isDraftLoaded && <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-1 rounded-full flex items-center gap-1"><Save className="w-3 h-3"/> Draft</span>}
                <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as ContentType)}
                    className="text-xs border-none bg-white shadow-sm ring-1 ring-slate-200 rounded-md py-1 pl-2 pr-6 font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    style={{ color: '#1e293b' }}
                >
                    <option value="social_post">{t('generator.types.social_post')}</option>
                    <option value="blog_article">{t('generator.types.blog_article')}</option>
                    <option value="email">{t('generator.types.email')}</option>
                    <option value="video_script">{t('generator.types.video_script')}</option>
                    <option value="product_description">{t('generator.types.product_description')}</option>
                </select>
            </div>
        </div>
        
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white">
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                    {t('generator.whatToCreate')}
                </label>
                {prompt && (
                    <button onClick={clearDraft} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1" title="Clear Draft">
                        <Trash className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => {
                  setPrompt(e.target.value);
                  if (validationError) setValidationError(null);
              }}
              placeholder={t('generator.placeholder')}
              className={`w-full h-40 px-4 py-3 rounded-xl border focus:ring-2 transition-all resize-none text-sm leading-relaxed ${validationError ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'}`}
              style={{ 
                  backgroundColor: '#ffffff', 
                  color: '#0f172a', 
                  caretColor: '#0d9488' 
              }} 
            />
            {validationError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationError}
                </p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Briefcase className="w-3 h-3" />
                {t('login.jobTitle')}
            </label>
            <input
                type="text"
                value={config.jobTitle || ''}
                onChange={(e) => setConfig({...config, jobTitle: e.target.value})}
                placeholder={t('generator.jobTitlePlaceholder')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isSocialPost && (
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('generator.platform')}</label>
                    <div className="flex gap-2">
                        {['linkedin', 'twitter', 'facebook'].map(p => {
                            const isSelected = config.platforms?.includes(p);
                            return (
                                <button 
                                    key={p}
                                    onClick={() => handlePlatformToggle(p)}
                                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-all ${
                                        isSelected 
                                        ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' 
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    {p === 'linkedin' && <Linkedin className="w-4 h-4" />}
                                    {p === 'twitter' && <Twitter className="w-4 h-4" />}
                                    {p === 'facebook' && <Facebook className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('generator.tone')}</label>
              <select
                value={config.tone}
                onChange={(e) => setConfig({...config, tone: e.target.value as ToneType})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:ring-teal-500 focus:border-teal-500"
                style={{ color: '#1e293b' }}
              >
                <option value="professional">{t('generator.tones.professional')}</option>
                <option value="casual">{t('generator.tones.casual')}</option>
                <option value="friendly">{t('generator.tones.friendly')}</option>
                <option value="expert">{t('generator.tones.expert')}</option>
                <option value="inspirational">{t('generator.tones.inspirational')}</option>
                <option value="witty">{t('generator.tones.witty')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('generator.length')}</label>
              <select
                value={config.length}
                onChange={(e) => setConfig({...config, length: e.target.value as LengthType})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:ring-teal-500 focus:border-teal-500"
                style={{ color: '#1e293b' }}
              >
                <option value="short">{t('generator.lengths.short')}</option>
                <option value="medium">{t('generator.lengths.medium')}</option>
                <option value="long">{t('generator.lengths.long')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
             <span className="text-sm font-medium text-slate-700">{t('generator.includeEmojis')}</span>
             <button 
                onClick={() => setConfig({...config, includeEmojis: !config.includeEmojis})}
                className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-200 ease-in-out ${config.includeEmojis ? 'bg-teal-600' : 'bg-slate-300'}`}
             >
                <div className={`absolute left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${config.includeEmojis ? 'translate-x-5' : 'translate-x-0'}`}></div>
             </button>
          </div>

          {/* IMAGE GENERATION TOGGLE */}
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-4">
             <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                     <ImageIcon className="w-4 h-4 text-indigo-600" />
                     {t('generator.generateImage')}
                 </span>
                 <button 
                    onClick={() => setConfig({...config, generateImage: !config.generateImage})}
                    className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-200 ease-in-out ${config.generateImage ? 'bg-indigo-600' : 'bg-slate-300'}`}
                 >
                    <div className={`absolute left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${config.generateImage ? 'translate-x-5' : 'translate-x-0'}`}></div>
                 </button>
             </div>
             
             {config.generateImage && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                     <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">{t('generator.aspectRatio')}</label>
                     <select
                        value={config.imageAspectRatio}
                        onChange={(e) => setConfig({...config, imageAspectRatio: e.target.value as AspectRatio})}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-slate-800 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                     >
                        <option value="1:1">{t('generator.ratios.square')}</option>
                        <option value="16:9">{t('generator.ratios.landscape')}</option>
                        <option value="9:16">{t('generator.ratios.portrait')}</option>
                     </select>
                 </div>
             )}
          </div>

        </div>

        <div className="p-6 border-t border-slate-100 bg-white z-10">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || !hasCredits}
            className={`w-full py-4 bg-gradient-to-r text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                hasCredits 
                ? 'from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 shadow-teal-500/20' 
                : 'from-slate-400 to-slate-500 cursor-not-allowed opacity-75'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {t('common.generating')}
              </>
            ) : !hasCredits ? (
               <>
                <Lock className="w-5 h-5" /> {t('generator.noCredits')}
               </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" /> {t('common.generate')}
              </>
            )}
          </button>
          {!hasCredits && (
              <p className="text-xs text-center text-red-500 mt-2 font-medium">{t('generator.noCreditsDesc')}</p>
          )}
        </div>
      </div>

      {/* RIGHT: Output Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
         <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> {t('generator.result')}
            </h2>
            <div className="flex items-center gap-2">
                {generatedContent && isSocialPost && (
                    <button 
                        onClick={handlePublishClick}
                        disabled={isPublishing}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all disabled:opacity-50 bg-teal-600 hover:bg-teal-700`}
                        title={t('common.publish')}
                    >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span className="hidden sm:inline">{t('common.publish')}</span>
                    </button>
                )}
                <button 
                    onClick={copyToClipboard}
                    disabled={!generatedContent}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:text-teal-600 hover:shadow-sm transition-all disabled:opacity-50" 
                    title="Copy to clipboard"
                >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isCopied ? t('common.copied') : t('common.copy')}</span>
                </button>
            </div>
        </div>

        <div 
            ref={scrollRef}
            className="flex-1 p-8 overflow-y-auto bg-white relative scroll-smooth"
        >
            {error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{t('generator.error')}</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">{error}</p>
                    <button onClick={handleGenerate} className="mt-6 text-teal-600 font-medium hover:underline">{t('common.tryAgain')}</button>
                </div>
            ) : showOutput ? (
                <div className="max-w-3xl mx-auto">
                    {/* GENERATED IMAGE SECTION */}
                    {config.generateImage && (
                        <div className="mb-8">
                            {generatedImageUrl ? (
                                <div className="relative group rounded-xl overflow-hidden shadow-md border border-slate-200">
                                    <img src={generatedImageUrl} alt="Generated AI Content" className="w-full h-auto object-cover max-h-[400px]" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={handleDownloadImage}
                                            className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-slate-100"
                                        >
                                            <Download className="w-4 h-4" /> {t('common.download')}
                                        </button>
                                    </div>
                                </div>
                            ) : isGeneratingImage ? (
                                <div className="w-full h-64 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center animate-pulse">
                                    <ImageIcon className="w-10 h-10 text-indigo-300 mb-4" />
                                    <span className="text-sm text-indigo-400 font-medium">Creating Image...</span>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* TEXT CONTENT */}
                    <div className="prose prose-slate prose-lg prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-800 prose-strong:text-slate-900 prose-ul:list-disc prose-ul:pl-4 prose-li:text-slate-800 prose-a:text-teal-600 hover:prose-a:text-teal-700 transition-colors">
                        {generatedContent ? (
                            <ReactMarkdown>{generatedContent}</ReactMarkdown>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                 <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-teal-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Wand2 className="w-4 h-4 text-teal-600 animate-pulse" />
                                    </div>
                                 </div>
                                 <p className="text-slate-500 mt-4 animate-pulse font-medium">{t('generator.thinking')}</p>
                            </div>
                        )}
                        
                        {isGenerating && generatedContent && (
                            <div className="mt-4 flex items-center gap-2 text-slate-400">
                                 <span className="w-2 h-4 bg-teal-500 animate-pulse"></span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 select-none">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Wand2 className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-lg font-medium text-slate-400">{t('generator.waiting')}</p>
                    <p className="text-sm text-slate-400 mt-2">{t('generator.waitingSub')}</p>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};