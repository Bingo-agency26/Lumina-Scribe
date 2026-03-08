import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplates } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import * as LucideIcons from 'lucide-react';

export const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const templates = getTemplates(language);

  return (
    <div className="max-w-7xl mx-auto pb-10">
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('templates.title')}</h1>
        <p className="text-slate-500 mt-2">{t('templates.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          // Dynamic Icon Rendering
          const IconComponent = (LucideIcons as any)[template.iconName] || LucideIcons.FileText;

          return (
            <div 
              key={template.id}
              onClick={() => navigate(`/generate?template=${template.id}`)}
              className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-100/50 transition-all cursor-pointer relative overflow-hidden h-full"
            >
              {/* Header */}
              <div className="p-6 pb-4 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 border border-slate-200 px-2 py-1 rounded-full bg-slate-50">
                        {template.type.replace('_', ' ')}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{template.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{template.description}</p>
              </div>

              {/* Example Preview Section */}
              <div className="flex-1 bg-slate-50/50 p-4 border-t border-slate-100 flex flex-col justify-end">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">{t('templates.example')}</p>
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-xs text-slate-600 font-mono leading-relaxed line-clamp-3 overflow-hidden">
                    {template.example}
                </div>
                <div className="mt-3 text-center">
                    <span className="text-sm font-bold text-teal-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        {t('templates.useTemplate')} <LucideIcons.ArrowRight className="w-4 h-4" />
                    </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
