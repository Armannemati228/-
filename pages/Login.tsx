
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Phone, LogIn, Info } from 'lucide-react';
import { APP_LOGO } from '../constants';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(phone);
    if (success) navigate('/'); else setError('کاربری با این شماره تماس یافت نشد.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-gray-700">
        <div className="p-8 text-center bg-gray-900 text-white">
          <img src={APP_LOGO} alt="Logo" className="w-24 h-24 mx-auto mb-4 rounded-full bg-black border-4 border-red-600 object-contain" />
          <h1 className="text-2xl font-bold mb-2 tracking-wider text-red-500">MR. ROTTWEILER</h1>
          <p className="text-gray-400 text-sm">سیستم جامع مدیریت باشگاه سگ‌ها</p>
        </div>
        
        <div className="p-8">
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 p-3 rounded-lg text-xs flex gap-2 items-start">
             <Info size={16} className="shrink-0 mt-0.5"/>
             <p>ثبت نام کاربران جدید فقط توسط مدیریت باشگاه انجام می‌شود. جهت دریافت حساب کاربری با پذیرش تماس بگیرید.</p>
          </div>

          {error && (<div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm text-center animate-pulse">{error}</div>)}
          
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">شماره موبایل</label>
                <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white text-left dir-ltr" placeholder="0912..." required />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">رمز عبور</label>
                <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="password" className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white text-left dir-ltr" placeholder="******" />
                </div>
            </div>
            <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-2">
                <LogIn size={20} /> ورود به حساب
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
