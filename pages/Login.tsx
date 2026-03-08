import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from '../components/Logo';
import { APP_NAME } from '../constants';
import { LogIn, AlertCircle, Linkedin, Facebook, Chrome, UserPlus, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { SignupData } from '../types';

export const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isVerificationMode, setIsVerificationMode] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // Verification State
  const [verificationCode, setVerificationCode] = useState('');

  const [error, setError] = useState('');
  const { login, signup, verifyEmail, socialLogin, tempUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      navigate('/');
    } else {
      setError(t('login.invalid'));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSendingEmail(true);
    
    const data: SignupData = {
        email,
        password,
        firstName,
        lastName,
        birthDate
    };
    
    // Simulate real email sending delay
    await signup(data);
    setIsSendingEmail(false);
    setIsVerificationMode(true);
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if(verifyEmail(verificationCode)) {
          navigate('/');
      } else {
          setError(t('login.invalidCode'));
      }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsSocialLoading(provider);
    try {
        await socialLogin(provider);
        navigate('/');
    } catch (e) {
        console.error(e);
    } finally {
        setIsSocialLoading(null);
    }
  };

  // Render Verification View
  if (isVerificationMode) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 animate-in zoom-in duration-300">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-teal-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">{t('login.verifyTitle')}</h2>
                <p className="text-center text-slate-500 mb-8">{t('login.verifySubtitle', { email: tempUser?.email || email })}</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-6">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                    </div>
                )}

                <form onSubmit={handleVerificationSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.verificationCode')}</label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-center text-2xl tracking-widest font-mono bg-white text-slate-900"
                            placeholder="123456"
                        />
                         <p className="text-xs text-slate-400 mt-2 text-center">Hint: Use 123456</p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {t('login.verify')} <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
                
                 <button onClick={() => setIsVerificationMode(false)} className="w-full mt-4 text-sm text-slate-400 hover:text-teal-600">
                    Back
                 </button>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-6">
            <Logo className="h-16 w-auto" />
        </div>
        <p className="text-slate-500 mt-2">{isLoginMode ? t('login.title') : t('login.createTitle')}</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 animate-in zoom-in duration-300">
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

        {/* LOGIN FORM */}
        {isLoginMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.email')}</label>
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none bg-white text-slate-900"
                    placeholder="name@company.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.password')}</label>
                    <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none bg-white text-slate-900"
                    placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    {t('login.signIn')}
                </button>
            </form>
        ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.firstName')}</label>
                        <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white text-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.lastName')}</label>
                        <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white text-slate-900"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.birthDate')}</label>
                    <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white text-slate-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.email')}</label>
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white text-slate-900"
                    placeholder="name@company.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.password')}</label>
                    <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white text-slate-900"
                    placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isSendingEmail ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Sending Email...
                        </>
                    ) : (
                        <>
                            <UserPlus className="w-5 h-5" />
                            {t('login.signUp')}
                        </>
                    )}
                </button>
            </form>
        )}

        <div className="mt-6 text-center">
            <button 
                onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setError('');
                }} 
                className="text-teal-600 font-medium hover:underline text-sm"
            >
                {isLoginMode ? t('login.noAccount') : t('login.hasAccount')}
            </button>
        </div>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">{t('common.or')}</span>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
             <button disabled={!!isSocialLoading} onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group disabled:opacity-50" title="Google">
                {isSocialLoading === 'Google' ? <Loader2 className="w-5 h-5 animate-spin text-slate-600" /> : <Chrome className="w-5 h-5 text-slate-600 group-hover:text-red-500" />}
             </button>
             <button disabled={!!isSocialLoading} onClick={() => handleSocialLogin('LinkedIn')} className="flex items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group disabled:opacity-50" title="LinkedIn">
                {isSocialLoading === 'LinkedIn' ? <Loader2 className="w-5 h-5 animate-spin text-slate-600" /> : <Linkedin className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />}
             </button>
             <button disabled={!!isSocialLoading} onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group disabled:opacity-50" title="Facebook">
                {isSocialLoading === 'Facebook' ? <Loader2 className="w-5 h-5 animate-spin text-slate-600" /> : <Facebook className="w-5 h-5 text-slate-600 group-hover:text-blue-800" />}
             </button>
        </div>
      </div>
      
      <p className="mt-8 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </div>
  );
};