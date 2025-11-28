
import * as React from 'react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole, TransactionType, UserPermissions } from '../types';
import { Mail, Phone, Plus, Edit2, X, Check, Wallet, Shield, Save, UserPlus, Briefcase, Percent, Target } from 'lucide-react';

const PermissionsForm: React.FC<{
  initialPermissions: UserPermissions;
  onSave: (perms: UserPermissions) => void;
  onCancel: () => void;
}> = ({ initialPermissions, onSave, onCancel }) => {
  const [permissions, setPermissions] = useState<UserPermissions>({
      accessDashboard: initialPermissions.accessDashboard ?? false,
      manageDogs: initialPermissions.manageDogs ?? false,
      manageFinance: initialPermissions.manageFinance ?? false,
      manageUsers: initialPermissions.manageUsers ?? false,
      manageMedical: initialPermissions.manageMedical ?? false,
      manageRooms: initialPermissions.manageRooms ?? false,
      viewReports: initialPermissions.viewReports ?? false,
      manageInventory: initialPermissions.manageInventory ?? false,
      log_food: initialPermissions.log_food ?? false,
      log_medical: initialPermissions.log_medical ?? false,
      log_training: initialPermissions.log_training ?? false,
      log_activity: initialPermissions.log_activity ?? false,
  });

  const handleChange = (key: keyof UserPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const permLabels: Record<keyof UserPermissions, string> = {
    accessDashboard: 'دسترسی به داشبورد',
    manageDogs: 'مدیریت سگ‌ها (پذیرش/ویرایش)',
    manageFinance: 'مدیریت امور مالی',
    manageUsers: 'مدیریت کاربران',
    manageMedical: 'مدیریت پزشکی',
    manageRooms: 'مدیریت اتاق‌ها',
    viewReports: 'مشاهده گزارشات',
    manageInventory: 'مدیریت انبار',
    log_food: 'ثبت گزارش تغذیه',
    log_medical: 'ثبت گزارش پزشکی',
    log_training: 'ثبت گزارش آموزش',
    log_activity: 'ثبت گزارش فعالیت/نظافت',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
        {Object.keys(permLabels).map((key) => {
          const k = key as keyof UserPermissions;
          return (
            <label key={k} className="flex items-center space-x-3 space-x-reverse cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors">
              <input type="checkbox" checked={permissions[k]} onChange={() => handleChange(k)} className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
              <span className="text-sm dark:text-gray-300 select-none">{permLabels[k]}</span>
            </label>
          );
        })}
      </div>
      <div className="flex gap-3 border-t dark:border-gray-700 pt-4 mt-2">
        <button onClick={onCancel} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">انصراف</button>
        <button onClick={() => onSave(permissions)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><Save size={18} /> ذخیره تغییرات</button>
      </div>
    </div>
  );
};

export const Users: React.FC = () => {
  const { users, currentUser, addUser, updateUser, transactions, adminUpdateWallet, updateUserPermissions } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState<string | null>(null); 
  const [showPermissionsModal, setShowPermissionsModal] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

  const [formData, setFormData] = useState<{
    name: string; phone: string; email: string; roles: UserRole[]; balance: string; employmentDate: string; baseSalary: string; commissionOverrides: { [key: string]: number };
  }>({ name: '', phone: '', email: '', roles: [UserRole.CLIENT], balance: '0', employmentDate: '', baseSalary: '0', commissionOverrides: {} });

  const [walletUpdate, setWalletUpdate] = useState({ amount: '', type: TransactionType.MANUAL_ADJUSTMENT, description: '' });

  const liveWalletUser = showWalletModal ? users.find(u => u.id === showWalletModal) : null;
  const livePermUser = showPermissionsModal ? users.find(u => u.id === showPermissionsModal) : null;

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', phone: '', email: '', roles: [UserRole.CLIENT], balance: '0', employmentDate: '', baseSalary: '0', commissionOverrides: {} });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name, phone: user.phone, email: user.email || '', roles: user.roles, balance: user.balance.toString(), employmentDate: user.employmentDate || '', baseSalary: user.baseSalary?.toString() || '0', commissionOverrides: user.commissionOverrides || {}
    });
    setShowModal(true);
  };

  const toggleRole = (role: UserRole) => {
    setFormData(prev => {
      if (prev.roles.includes(role)) { if (prev.roles.length === 1) return prev; return { ...prev, roles: prev.roles.filter(r => r !== role) }; } else { return { ...prev, roles: [...prev.roles, role] }; }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || formData.roles.length === 0) { alert('نام، شماره تماس و حداقل یک نقش الزامی است.'); return; }
    const userPayload: any = { name: formData.name, phone: formData.phone, email: formData.email, roles: formData.roles, employmentDate: formData.employmentDate, baseSalary: Number(formData.baseSalary), commissionOverrides: formData.commissionOverrides };
    if (editingUser) {
      updateUser({ ...editingUser, ...userPayload });
    } else {
      const newUser: User = { id: `u${Date.now()}`, ...userPayload, balance: Number(formData.balance), joinedDate: new Date().toLocaleDateString('fa-IR'), avatar: `https://ui-avatars.com/api/?name=${formData.name}&background=random`, permissions: { accessDashboard: true, manageDogs: false, manageFinance: false, manageUsers: false, manageMedical: false, manageRooms: false, viewReports: false, manageInventory: false, log_food: false, log_medical: false, log_training: false, log_activity: false } };
      addUser(newUser);
    }
    setShowModal(false);
  };

  const handleWalletUpdate = (e: React.FormEvent) => {
      e.preventDefault(); if (!liveWalletUser) return;
      adminUpdateWallet(liveWalletUser.id, Number(walletUpdate.amount), walletUpdate.type, walletUpdate.description);
      setWalletUpdate({ amount: '', type: TransactionType.MANUAL_ADJUSTMENT, description: '' }); alert('موجودی کیف پول بروزرسانی شد');
  };

  const handlePermissionsUpdate = (permissions: UserPermissions) => {
      if (!livePermUser) return;
      updateUserPermissions(livePermUser.id, permissions);
      alert('سطوح دسترسی کاربر بروزرسانی شد');
      setShowPermissionsModal(null);
  };

  const getUserTransactions = (userId: string) => transactions.filter(t => t.userId === userId).sort((a, b) => b.id.localeCompare(a.id));
  const isStaff = formData.roles.some(r => r !== UserRole.CLIENT);
  const commissionTypes = [ { key: 'Obedience', label: 'مربی فرامین' }, { key: 'Guard', label: 'مربی گارد' }, { key: 'Behavior', label: 'رفع ناهنجاری' }, { key: 'Scent', label: 'بویایی' }, { key: 'Puppy', label: 'مربی پاپی' }, { key: 'Boarding', label: 'پانسیون' }, { key: 'Grooming', label: 'آرایش' }, { key: 'Medical', label: 'پزشکی' } ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">کاربران و پرسنل</h2>{isAdmin && (<div className="flex gap-2"><button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/30"><Plus size={18} /> افزودن کاربر</button></div>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{users.map(user => (<div key={user.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative group hover:shadow-md transition-shadow">{isAdmin && (<><button onClick={() => openEditModal(user)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"><Edit2 size={16} /></button><button onClick={() => setShowWalletModal(user.id)} className="absolute top-4 right-12 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"><Wallet size={16} /></button><button onClick={() => setShowPermissionsModal(user.id)} className="absolute top-4 right-20 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"><Shield size={16} /></button></>)}<div className={`absolute top-4 left-4 flex flex-wrap justify-end gap-1 max-w-[70%] z-10 ${isAdmin ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`} onClick={() => isAdmin && openEditModal(user)}>{user.roles.map(role => (<span key={role} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${role === UserRole.ADMIN ? 'border-red-200 text-red-600 bg-red-50' : role === UserRole.TRAINER ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>{role}</span>))}</div><img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-4 border-4 border-gray-50 dark:border-gray-700 mt-6" /><h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{user.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400 mb-4">عضویت: {user.joinedDate}</p><div className="w-full space-y-2"><div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg"><Phone size={16} /><span>{user.phone}</span></div>{user.email && (<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg"><Mail size={16} /><span>{user.email}</span></div>)}{user.baseSalary && user.baseSalary > 0 && (<div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600"><Briefcase size={16} /><span>حقوق ثابت: {new Intl.NumberFormat('fa-IR').format(user.baseSalary)}</span></div>)}</div><div className="mt-4 w-full pt-4 border-t dark:border-gray-700 flex justify-between items-center"><span className="text-xs text-gray-500">موجودی:</span><span className={`font-bold ${user.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{new Intl.NumberFormat('fa-IR').format(user.balance)} ت</span></div></div>))}</div>
      {showModal && isAdmin && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full animate-fade-in shadow-2xl border dark:border-gray-700 max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold dark:text-white">{editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}</h3><button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"><X size={24} /></button></div><form className="space-y-4" onSubmit={handleSubmit}><div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">نام *</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white" required /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">موبایل *</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white" required /></div><div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">ایمیل</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white" /></div></div><div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">نقش‌ها</label><div className="grid grid-cols-2 gap-2">{Object.values(UserRole).map(role => (<button key={role} type="button" onClick={() => toggleRole(role)} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${formData.roles.includes(role) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{role} {formData.roles.includes(role) && <Check size={16} />}</button>))}</div></div>{isStaff && (<div className="border-t dark:border-gray-700 pt-4 mt-2"><h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2"><Briefcase size={16}/> اطلاعات مالی</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">شروع همکاری</label><input type="text" placeholder="1402/01/01" value={formData.employmentDate} onChange={e => setFormData({...formData, employmentDate: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white text-center" /></div><div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">حقوق ثابت</label><input type="number" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white text-center" /></div></div><div><div className="flex items-center justify-between mb-2"><label className="block text-xs text-gray-500 dark:text-gray-400"><Target size={14} className="inline mr-1"/>درصد پورسانت اختصاصی</label></div><div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">{commissionTypes.map(type => (<div key={type.key} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border dark:border-gray-600"><span className="text-xs flex-1 dark:text-gray-300">{type.label}</span><input type="number" placeholder="%" className="w-16 p-1 text-xs text-center rounded border dark:bg-gray-600 dark:text-white" value={formData.commissionOverrides[type.key] || ''} onChange={(e) => setFormData({ ...formData, commissionOverrides: { ...formData.commissionOverrides, [type.key]: Number(e.target.value) } })} /><Percent size={12} className="text-gray-400"/></div>))}</div></div></div>)}{!editingUser && (<div><label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">موجودی اولیه</label><input type="number" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white" /></div>)}<div className="flex gap-3 pt-4 border-t dark:border-gray-700 mt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">انصراف</button><button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg font-bold flex items-center justify-center gap-2">{editingUser ? <Save size={20} /> : <UserPlus size={20} />} {editingUser ? 'بروزرسانی' : 'ایجاد'}</button></div></form></div></div>)}
      {livePermUser && isAdmin && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full animate-fade-in shadow-2xl"><div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 text-green-600 rounded-full"><Shield size={20}/></div><div><h3 className="text-lg font-bold dark:text-white">سطوح دسترسی</h3><p className="text-xs text-gray-500">{livePermUser.name}</p></div></div><button onClick={() => setShowPermissionsModal(null)}><X size={20} className="text-gray-500"/></button></div><PermissionsForm initialPermissions={livePermUser.permissions} onSave={handlePermissionsUpdate} onCancel={() => setShowPermissionsModal(null)} /></div></div>)}
      {liveWalletUser && isAdmin && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-2xl"><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white flex items-center gap-2"><Wallet size={20} className="text-purple-500"/> مدیریت کیف پول</h3><button onClick={() => setShowWalletModal(null)}><X size={20} className="text-gray-500"/></button></div><div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl mb-4 text-center border border-purple-100 dark:border-purple-800"><p className="text-xs text-purple-600 dark:text-purple-300 mb-1">موجودی فعلی {liveWalletUser.name}</p><p className="text-xl font-black text-purple-800 dark:text-purple-100">{new Intl.NumberFormat('fa-IR').format(liveWalletUser.balance)} تومان</p></div><form onSubmit={handleWalletUpdate} className="space-y-3"><div><label className="block text-xs mb-1 dark:text-gray-300">نوع تراکنش</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white text-sm" value={walletUpdate.type} onChange={e => setWalletUpdate({...walletUpdate, type: e.target.value as TransactionType})}><option value={TransactionType.MANUAL_ADJUSTMENT}>تغییر دستی</option><option value={TransactionType.DEPOSIT}>افزایش اعتبار</option><option value={TransactionType.WITHDRAWAL}>کاهش اعتبار</option><option value={TransactionType.BONUS}>پاداش</option><option value={TransactionType.SALARY}>حقوق</option></select></div><div><label className="block text-xs mb-1 dark:text-gray-300">مبلغ (تومان)</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" required value={walletUpdate.amount} onChange={e => setWalletUpdate({...walletUpdate, amount: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">توضیحات</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" required value={walletUpdate.description} onChange={e => setWalletUpdate({...walletUpdate, description: e.target.value})} /></div><button type="submit" className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 mt-2">ثبت تغییرات</button></form><div className="mt-4 pt-4 border-t dark:border-gray-700"><p className="text-xs font-bold mb-2 dark:text-gray-300">تاریخچه تراکنش‌ها</p><div className="max-h-32 overflow-y-auto space-y-2">{getUserTransactions(liveWalletUser.id).map(t => (<div key={t.id} className="flex justify-between text-[10px] p-2 bg-gray-50 dark:bg-gray-700 rounded"><span className={t.isCredit ? 'text-green-600' : 'text-red-600'}>{t.type}</span><span className="dark:text-gray-300">{new Intl.NumberFormat('fa-IR').format(t.amount)}</span><span className="text-gray-400">{t.date}</span></div>))}</div></div></div></div>)}
    </div>
  );
};
