
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { History as HistoryIcon, Filter, Printer, Search, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const History: React.FC = () => {
  const { systemLogs, dailyChecklists, users, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'logs' | 'checklists'>('logs');
  
  // Filters
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (!currentUser?.roles.includes(UserRole.ADMIN)) {
      return <div className="p-8 text-center text-gray-500">شما به این بخش دسترسی ندارید.</div>;
  }

  // --- LOGS FILTERING ---
  const filteredLogs = useMemo(() => {
      return systemLogs.filter(log => {
          const matchesUser = selectedUser ? (log.userId === selectedUser || log.performedBy === selectedUser) : true;
          const matchesCategory = selectedCategory ? log.category === selectedCategory : true;
          const matchesSearch = searchQuery 
              ? (log.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 log.performedBy.toLowerCase().includes(searchQuery.toLowerCase())) 
              : true;
          return matchesUser && matchesCategory && matchesSearch;
      });
  }, [systemLogs, selectedUser, selectedCategory, searchQuery]);

  // --- CHECKLISTS FILTERING ---
  const archivedChecklists = useMemo(() => {
      return dailyChecklists.filter(c => c.verifiedByAdmin);
  }, [dailyChecklists]);

  // PAGINATION LOGIC
  const currentData = activeTab === 'logs' ? filteredLogs : archivedChecklists;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 print:hidden">
          <div><h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><HistoryIcon className="text-blue-600"/> تاریخچه و بایگانی</h2><p className="text-sm text-gray-500 mt-1">گزارش کامل عملیات و آرشیو چک‌لیست‌ها</p></div>
          <div className="flex gap-2">
              <button onClick={() => { setActiveTab('logs'); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'logs' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>لاگ سیستم</button>
              <button onClick={() => { setActiveTab('checklists'); setCurrentPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'checklists' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>آرشیو چک‌لیست‌ها</button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-bold"><Printer size={18}/> چاپ</button>
          </div>
      </div>

      {activeTab === 'logs' && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end print:hidden">
              <div className="flex-1 w-full"><label className="block text-xs font-medium text-gray-500 mb-1">جستجو در توضیحات</label><div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><input type="text" placeholder="جستجو..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pr-9 pl-4 py-2 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" /></div></div>
              <div className="w-full md:w-64"><label className="block text-xs font-medium text-gray-500 mb-1">فیلتر کاربر</label><div className="relative"><User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full pr-9 pl-4 py-2 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 appearance-none"><option value="">همه کاربران</option>{users.map(u => (<option key={u.id} value={u.id}>{u.name} ({u.roles.join(', ')})</option>))}</select></div></div>
              <div className="w-full md:w-48"><label className="block text-xs font-medium text-gray-500 mb-1">دسته‌بندی</label><div className="relative"><Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/><select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full pr-9 pl-4 py-2 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 appearance-none"><option value="">همه دسته‌ها</option><option value="User">کاربران</option><option value="Finance">مالی</option><option value="Operation">عملیات</option><option value="Emergency">اضطراری</option><option value="Medical">پزشکی</option><option value="System">سیستمی</option></select></div></div>
          </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden print:border-2 print:border-black">
          {activeTab === 'logs' ? (
              <table className="w-full text-right text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b dark:border-gray-600"><tr><th className="p-4">زمان</th><th className="p-4">کاربر</th><th className="p-4">نقش</th><th className="p-4">دسته</th><th className="p-4">عملیات</th><th className="p-4">توضیحات</th></tr></thead>
                  <tbody className="divide-y dark:divide-gray-700">
                      {(paginatedData as any[]).map((log: any) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="p-4 whitespace-nowrap font-mono text-xs text-gray-500">{log.timestamp}</td>
                              <td className="p-4 font-bold dark:text-white">{log.performedBy}</td>
                              <td className="p-4 text-xs text-gray-500">{log.userRole || '---'}</td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-xs border ${log.category === 'Finance' ? 'bg-green-50 text-green-700 border-green-200' : log.category === 'Emergency' ? 'bg-red-50 text-red-700 border-red-200' : log.category === 'User' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{log.category}</span></td>
                              <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{log.action}</td>
                              <td className="p-4 text-gray-600 dark:text-gray-400">{log.description}</td>
                          </tr>
                      ))}
                      {paginatedData.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-gray-400">هیچ رکوردی یافت نشد.</td></tr>)}
                  </tbody>
              </table>
          ) : (
              <table className="w-full text-right text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b dark:border-gray-600"><tr><th className="p-4">تاریخ</th><th className="p-4">زمان ثبت</th><th className="p-4">مدیر داخلی</th><th className="p-4">تعداد آیتم</th><th className="p-4">وضعیت</th><th className="p-4">عملیات</th></tr></thead>
                  <tbody className="divide-y dark:divide-gray-700">
                      {(paginatedData as any[]).map((chk: any) => (
                          <tr key={chk.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="p-4">{chk.date}</td>
                              <td className="p-4 font-mono text-gray-500">{chk.submissionTime}</td>
                              <td className="p-4 font-bold dark:text-white">{chk.managerName}</td>
                              <td className="p-4">{chk.items.length} مورد</td>
                              <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">تایید شده</span></td>
                              <td className="p-4"><button className="text-blue-600 hover:underline">مشاهده جزئیات</button></td>
                          </tr>
                      ))}
                      {paginatedData.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-gray-400">هیچ چک‌لیست آرشیو شده‌ای یافت نشد.</td></tr>)}
                  </tbody>
              </table>
          )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-4 print:hidden">
              <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border bg-white dark:bg-gray-800 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                  <ChevronRight size={20}/>
              </button>
              <span className="text-sm font-bold dark:text-white">صفحه {currentPage} از {totalPages}</span>
              <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border bg-white dark:bg-gray-800 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                  <ChevronLeft size={20}/>
              </button>
          </div>
      )}
    </div>
  );
};
