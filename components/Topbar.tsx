
import * as React from 'react';
import { Moon, Sun, Menu, Bell, Search, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Topbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode, currentUser, logout } = useApp();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Menu size={24} /></button>
        <div className="relative hidden md:block"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="جستجو در سیستم..." className="pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64 text-gray-700 dark:text-gray-200"/></div>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <button onClick={toggleDarkMode} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="تغییر تم">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
        <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><Bell size={20} /><span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span></button>
        <div className="flex items-center gap-3 border-r dark:border-gray-600 pr-4 mr-2">
          <div className="text-left hidden md:block"><p className="text-sm font-bold text-gray-800 dark:text-gray-100">{currentUser?.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 max-w-[150px] truncate">{currentUser?.roles.join(' - ')}</p></div>
          <img src={currentUser?.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-blue-100 dark:border-blue-900"/>
          <button onClick={logout} className="mr-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="خروج"><LogOut size={20} /></button>
        </div>
      </div>
    </header>
  );
};
