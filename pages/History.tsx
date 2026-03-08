import React, { useEffect, useState } from 'react';
import { GenerationHistory } from '../types';
import { Clock, Trash2, Copy, ChevronDown, ChevronUp, Check, Calendar, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const History: React.FC = () => {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { getHistory, clearHistory: clearUserHistory } = useAuth();

  useEffect(() => {
    // Fetch user specific history from context
    setHistory(getHistory());
  }, [getHistory]);

  const clearHistory = () => {
    if(confirm(t('history.confirmClear'))) {
        clearUserHistory();
        setHistory([]);
    }
  }

  // To properly implement delete, we need the user object to reconstruct the key
  const { user } = useAuth();
  
  const handleDeleteReal = (id: string) => {
      if (!user) return;
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem(`ls_history_${user.email}`, JSON.stringify(updatedHistory));
  }

  const handleCopy = (content: string, id: string) => {
      navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  }

  const toggleExpand = (id: string) => {
      setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('history.title')}</h1>
            <p className="text-slate-500 mt-1 text-sm">{t('history.subtitle')}</p>
        </div>
        {history.length > 0 && (
            <button onClick={clearHistory} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">{t('common.clearAll')}</span>
            </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">{t('history.emptyTitle')}</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">{t('history.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-6">
            {history.map((item) => {
                const isExpanded = expandedId === item.id;
                
                return (
                <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden group ${isExpanded ? 'border-teal-400 shadow-md ring-1 ring-teal-100' : 'border-slate-200 hover:border-teal-200 hover:shadow-sm'}`}
                >
                    {/* Header Section */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 justify-between items-start">
                        <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold tracking-wider text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase">
                                    {item.type.replace('_', ' ')}
                                </span>
                                {item.imageUrl && (
                                    <span className="text-[10px] font-bold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" /> Image
                                    </span>
                                )}
                                <span className="text-xs text-slate-400 flex items-center gap-1 ml-2">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                             <h3 className="font-semibold text-slate-800 text-sm md:text-base line-clamp-1" title={item.prompt}>
                                <span className="text-slate-400 font-normal mr-2">{t('history.prompt')}</span> 
                                {item.prompt}
                             </h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleCopy(item.content, item.id)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm"
                                title={t('common.copy')}
                            >
                                {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button 
                                onClick={() => handleDeleteReal(item.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm"
                                title={t('common.delete')}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className={`p-6 relative transition-all duration-500 ease-in-out flex flex-col gap-6`}>
                        {isExpanded && item.imageUrl && (
                            <div className="w-full max-w-sm rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                <img src={item.imageUrl} alt="Generated Asset" className="w-full h-auto" />
                            </div>
                        )}

                        <div className={`prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-teal-600 ${!isExpanded ? 'line-clamp-3 max-h-[100px] overflow-hidden opacity-80' : 'opacity-100'}`}>
                            <ReactMarkdown>{item.content}</ReactMarkdown>
                        </div>
                        
                        {/* Fade overlay when collapsed */}
                        {!isExpanded && (
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                    </div>

                    {/* Footer / Toggle Button */}
                    <button 
                        onClick={() => toggleExpand(item.id)}
                        className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center justify-center gap-1 transition-colors"
                    >
                        {isExpanded ? (
                            <>{t('history.showLess')} <ChevronUp className="w-4 h-4" /></>
                        ) : (
                            <>{t('history.readFull')} <ChevronDown className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            )})}
        </div>
      )}
    </div>
  );
};