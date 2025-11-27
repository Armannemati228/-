
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dog, Users, Wallet, Settings, Activity, LogOut, Package, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { APP_LOGO } from '../constants';
import { UserRole } from '../types';

export const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useApp();

  const canAccessInventory = currentUser?.permissions.manageInventory;
  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

  const menuItems = [
    { name: 'داشبورد', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'کیف پول و امور مالی', path: '/finance', icon: <Wallet size={20} /> },
    { name: 'مدیریت سگ‌ها', path: '/dogs', icon: <Dog size={20} /> },
    { name: 'کاربران و پرسنل', path: '/users', icon: <Users size={20} /> },
    ...(canAccessInventory ? [{ name: 'مدیریت انبار', path: '/inventory', icon: <Package size={20} /> }] : []),
    { name: 'هوش مصنوعی', path: '/ai-insights', icon: <Activity size={20} /> },
    ...(isAdmin ? [{ name: 'تاریخچه و لاگ‌ها', path: '/history', icon: <History size={20} /> }] : []),
    { name: 'تنظیمات', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      <aside className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700 shadow-xl z-30 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-24 flex flex-col items-center justify-center border-b dark:border-gray-700 py-4">
          <div className="flex items-center gap-2 px-4">
             <img src={APP_LOGO} alt="Mr. Rottweiler" className="w-12 h-12 object-contain rounded-full bg-black" />
             <div className="text-center">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">Mr. Rottweiler</h1>
                <p className="text-xs text-gray-500">باشگاه تخصصی سگ‌ها</p>
             </div>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => handleNavigation(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-sm font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'}`}>
                <span className={`${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>{item.icon}</span>{item.name}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm"><LogOut size={18} />خروج از حساب</button>
        </div>
      </aside>
    </>
  );
};
