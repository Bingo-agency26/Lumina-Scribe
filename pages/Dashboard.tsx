import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, FileText, Zap, ArrowUpRight, Crown, History as HistoryIcon, Linkedin, Twitter, Facebook, Plug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { GenerationHistory, ConnectedAccounts } from '../types';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="flex items-center text-emerald-500 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
        {change} <ArrowUpRight className="w-3 h-3 ml-1" />
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const IntegrationCard = ({ platform, icon: Icon, color, isConnected, onToggle }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-white`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <h4 className="font-semibold text-slate-800 text-sm">{platform}</h4>
                <p className="text-xs text-slate-400">{isConnected ? 'Connected' : 'Not Connected'}</p>
            </div>
        </div>
        <button 
            onClick={onToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isConnected 
                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
        >
            {isConnected ? 'Disconnect' : 'Connect'}
        </button>
    </div>
)

export const Dashboard: React.FC = () => {
  const { user, getHistory, toggleConnection } = useAuth();
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<any[]>([]);

  // Calculate chart data from real history
  useEffect(() => {
    // FIX: Get history from context method which is user-specific now
    const history: GenerationHistory[] = getHistory();
    
    if (history && history.length > 0) {
      // Group by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"...
      }).reverse();

      const dataMap = last7Days.map(day => ({ name: day, words: 0 }));

      history.forEach(item => {
        const itemDate = new Date(item.createdAt);
        const dayName = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Find if this day is in our chart range
        const dataPoint = dataMap.find(d => d.name === dayName);
        if (dataPoint) {
          // Estimate word count (basic split)
          const wordCount = item.content.split(/\s+/).length;
          dataPoint.words += wordCount;
        }
      });

      setChartData(dataMap);
    } else {
      // Default empty state if no history
       const emptyWeek = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), words: 0 };
      }).reverse();
      setChartData(emptyWeek);
    }
  }, [getHistory]);

  if (!user) return null;

  const quickStartItems = [
    { label: t('dashboard.cards.blog'), icon: FileText },
    { label: t('dashboard.cards.insta'), icon: FileText },
    { label: t('dashboard.cards.email'), icon: FileText },
    { label: t('dashboard.cards.tweet'), icon: FileText }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.welcome', { name: user.name })}</h1>
          <p className="text-slate-500 mt-2">{t('dashboard.subtitle')}</p>
        </div>
        {user.unlimited && (
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-4 py-2 rounded-full font-bold text-sm shadow-sm">
            <Crown className="w-4 h-4" />
            {t('dashboard.unlimitedActive')}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={t('dashboard.wordsGenerated')} 
          value={user.stats.totalWords.toLocaleString()} 
          change="Total" 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          title={t('dashboard.docsCreated')} 
          value={user.stats.documentsCreated} 
          change="Total" 
          icon={Zap} 
          color="bg-amber-500" 
        />
        <StatCard 
          title={t('dashboard.creditsRemaining')} 
          value={user.unlimited ? "∞" : user.credits} 
          change={user.unlimited ? t('common.proPlan') : t('dashboard.refill')}
          icon={Activity} 
          color="bg-teal-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">{t('dashboard.activityOverview')}</h2>
                    <Link to="/history" className="text-sm text-slate-400 hover:text-teal-600 flex items-center gap-1">
                        <HistoryIcon className="w-3 h-3" /> {t('common.history')}
                    </Link>
                </div>
                
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                        <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                        formatter={(value: number) => [`${value}`, t('dashboard.wordsGenerated')]}
                        />
                        <Area type="monotone" dataKey="words" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorWords)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Integrations Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Plug className="w-5 h-5 text-teal-600" />
                        {t('dashboard.integrations')}
                    </h2>
                </div>
                <p className="text-slate-500 text-sm mb-6">{t('dashboard.manageIntegrations')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <IntegrationCard 
                        platform="LinkedIn" 
                        icon={Linkedin} 
                        color="bg-blue-600" 
                        isConnected={user.connectedAccounts.linkedin}
                        onToggle={() => toggleConnection('linkedin')}
                    />
                    <IntegrationCard 
                        platform="Twitter" 
                        icon={Twitter} 
                        color="bg-sky-500" 
                        isConnected={user.connectedAccounts.twitter}
                        onToggle={() => toggleConnection('twitter')}
                    />
                    <IntegrationCard 
                        platform="Facebook" 
                        icon={Facebook} 
                        color="bg-blue-800" 
                        isConnected={user.connectedAccounts.facebook}
                        onToggle={() => toggleConnection('facebook')}
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-8 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden flex-1 min-h-[300px]">
            <div className="absolute top-0 right-0 p-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold">{t('dashboard.proAccess')}</h2>
                </div>
                
                {user.isPro ? (
                <div className="space-y-4">
                    <p className="text-teal-200">{t('dashboard.proDescActive')}</p>
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <p className="text-xs text-teal-300 uppercase tracking-wider mb-1">{t('dashboard.status')}</p>
                        <p className="font-bold flex items-center gap-2">{t('dashboard.active')} <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span></p>
                    </div>
                </div>
                ) : (
                    <>
                        <p className="text-teal-200 text-sm mb-6">{t('dashboard.proDescInactive')}</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-sm text-teal-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                                {t('common.unlimited')}
                            </li>
                            <li className="flex items-center gap-2 text-sm text-teal-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                                GPT-4 & Gemini Advanced
                            </li>
                        </ul>
                    </>
                )}
            </div>
            
            {!user.isPro && (
                <button className="w-full py-3 bg-white text-teal-900 rounded-xl font-bold hover:bg-teal-50 transition-colors shadow-lg">
                    {t('dashboard.getPro')}
                </button>
            )}
            </div>
            
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">{t('dashboard.quickStart')}</h2>
                    <Link to="/templates" className="text-sm text-teal-600 hover:text-teal-700 font-medium">{t('dashboard.viewAll')}</Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {quickStartItems.map((item, i) => (
                        <Link to="/generate" key={i} className="p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all group cursor-pointer flex flex-col items-center text-center">
                            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-800 text-sm">{item.label}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
