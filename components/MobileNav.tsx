import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, Library, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MobileNav: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-50 flex justify-around items-center pb-safe">
      <NavLink 
        to="/" 
        className={({isActive}) => `p-3 rounded-lg flex flex-col items-center gap-1 ${isActive ? 'text-teal-600' : 'text-slate-500'}`}
      >
        <LayoutDashboard className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('common.dashboard')}</span>
      </NavLink>
      <NavLink 
        to="/generate" 
        className={({isActive}) => `p-3 rounded-lg flex flex-col items-center gap-1 ${isActive ? 'text-teal-600' : 'text-slate-500'}`}
      >
        <PenTool className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('common.generator')}</span>
      </NavLink>
      <NavLink 
        to="/templates" 
        className={({isActive}) => `p-3 rounded-lg flex flex-col items-center gap-1 ${isActive ? 'text-teal-600' : 'text-slate-500'}`}
      >
        <Library className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('common.templates')}</span>
      </NavLink>
       <NavLink 
        to="/history" 
        className={({isActive}) => `p-3 rounded-lg flex flex-col items-center gap-1 ${isActive ? 'text-teal-600' : 'text-slate-500'}`}
      >
        <History className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('common.history')}</span>
      </NavLink>
    </div>
  );
};
