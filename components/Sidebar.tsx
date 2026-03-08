import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenTool, 
  History, 
  Library,
  LogOut,
  Crown,
  Languages
} from 'lucide-react';
import { Logo } from './Logo';
import { APP_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-teal-50 text-teal-700 font-medium shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20 hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <Logo className="w-8 h-8 text-teal-600" />
        <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
          {APP_NAME}
        </span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2">
        <NavItem to="/" icon={LayoutDashboard} label={t('common.dashboard')} />
        <NavItem to="/generate" icon={PenTool} label={t('common.generator')} />
        <NavItem to="/templates" icon={Library} label={t('common.templates')} />
        <NavItem to="/history" icon={History} label={t('common.history')} />
      </div>

      <div className="p-4 border-t border-slate-100">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between px-4 py-2 mb-4 rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
        >
           <div className="flex items-center gap-2">
             <Languages className="w-4 h-4 text-teal-600" />
             <span>{language === 'fr' ? 'Français' : 'English'}</span>
           </div>
           <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{language}</span>
        </button>

        {user && (
            <div className={`px-4 py-3 rounded-xl text-white mb-2 ${user.unlimited ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-teal-900'}`}>
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-medium uppercase flex items-center gap-1 ${user.unlimited ? 'text-amber-100' : 'text-teal-200'}`}>
                    {user.unlimited && <Crown className="w-3 h-3" />} {t('common.credits')}
                </span>
                <span className="text-sm font-bold">{user.unlimited ? t('common.proPlan') : t('common.freePlan')}</span>
            </div>
            
            {user.unlimited ? (
                <div className="text-center font-bold text-amber-50 text-sm py-1">
                    {t('common.unlimited')}
                </div>
            ) : (
                <>
                    <div className="w-full bg-teal-800 rounded-full h-2 mb-2">
                        <div 
                            className="bg-teal-400 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(user.credits / 5) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-teal-300">{user.credits}/5</p>
                </>
            )}
            </div>
        )}

        <div className="space-y-1">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-medium"
            >
                <LogOut className="w-5 h-5" />
                <span>{t('common.signOut')}</span>
            </button>
        </div>
      </div>
    </div>
  );
};
