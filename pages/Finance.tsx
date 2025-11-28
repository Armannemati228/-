
import * as React from 'react';
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { InvoiceStatus, Invoice, Check, JournalEntryLine, Account, AccountType, UserRole, PaymentMethod } from '../types';
import { FileText, Receipt, Scale, TrendingDown, Users, Activity, Book, Wallet, CreditCard, Plus, Trash2, CheckCircle, X, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

export const Finance: React.FC = () => {
  const { invoices, expenses, users, dogs, services, payInvoice, financials, canManageFinance, addInvoice, addExpense, accounts, journalEntries, checks, addCheck, updateCheckStatus, recordJournalEntry, deleteJournalEntry, addAccount, processMonthlyPayroll, currentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'expenses' | 'checks' | 'payroll' | 'accounting'>('dashboard');
  const [accountingSubTab, setAccountingSubTab] = useState<'journal' | 'ledger' | 'coa' | 'trial'>('journal');

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false); 
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [newInvoice, setNewInvoice] = useState({ userId: '', serviceId: '', price: '', dueDate: '', discount: '' });
  
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' }); 
  const [expenseTargetType, setExpenseTargetType] = useState<'General' | 'User' | 'Dog'>('General');
  const [expenseTargetId, setExpenseTargetId] = useState('');
  
  const [newCheck, setNewCheck] = useState<Partial<Check>>({ type: 'Received', amount: 0, checkNumber: '', bankName: '', dueDate: '', issuerOrPayee: '' });
  
  const [manualEntry, setManualEntry] = useState<{ description: string, lines: { accountId: string, debit: string, credit: string }[] }>({
      description: '', lines: [{ accountId: '', debit: '', credit: '' }, { accountId: '', debit: '', credit: '' }]
  });
  const [newAccount, setNewAccount] = useState<Partial<Account>>({ code: '', name: '', type: 'Asset', isActive: true });

  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('');

  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

  const ledgerData = useMemo(() => {
      if (!selectedAccountCode) return [];
      const relevantEntries = journalEntries.filter(je => je.lines.some(l => l.accountId === selectedAccountCode));
      relevantEntries.sort((a, b) => a.documentNumber - b.documentNumber);
      let balance = 0;
      return relevantEntries.flatMap(entry => {
          const line = entry.lines.find(l => l.accountId === selectedAccountCode);
          if (!line) return [];
          balance += (line.debit - line.credit);
          return [{ ...entry, debit: line.debit, credit: line.credit, balance }];
      });
  }, [journalEntries, selectedAccountCode]);

  const accountBalances = useMemo(() => {
      const balances: Record<string, number> = {};
      journalEntries.forEach(entry => {
          entry.lines.forEach(line => { balances[line.accountId] = (balances[line.accountId] || 0) + (line.debit - line.credit); });
      });
      return balances;
  }, [journalEntries]);

  const trialBalance = useMemo(() => {
      return accounts.map(acc => ({ code: acc.code, name: acc.name, balance: accountBalances[acc.code] || 0, type: acc.type })).filter(a => Math.abs(a.balance) > 0);
  }, [accounts, accountBalances]);

  const chartData = useMemo(() => {
      const data: any[] = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
          const d = new Date(); d.setDate(today.getDate() - i); const dateStr = d.toLocaleDateString('fa-IR');
          const dailyIncome = invoices.filter(inv => inv.status === InvoiceStatus.PAID && inv.date === dateStr).reduce((sum, inv) => sum + inv.finalAmount, 0);
          const dailyExpense = expenses.filter(exp => exp.date === dateStr).reduce((sum, exp) => sum + exp.amount, 0);
          data.push({ name: dateStr, income: dailyIncome, expense: dailyExpense });
      }
      return data;
  }, [invoices, expenses]);

  const walletDistribution = useMemo(() => {
      return users.filter(u => u.balance !== 0).sort((a, b) => b.balance - a.balance).slice(0, 10).map(u => ({ name: u.name, balance: u.balance, fill: u.balance > 0 ? '#10B981' : '#EF4444' }));
  }, [users]);

  const expenseCategoryData = useMemo(() => {
      const catMap: Record<string, number> = {};
      expenses.forEach(e => { const acc = accounts.find(a => a.code === e.category); const name = acc ? acc.name : e.category; catMap[name] = (catMap[name] || 0) + e.amount; });
      return Object.keys(catMap).map(name => ({ name, value: catMap[name] }));
  }, [expenses, accounts]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleAddInvoice = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newInvoice.userId || !newInvoice.serviceId) return;
      const service = services.find(s => s.id === newInvoice.serviceId);
      const price = Number(newInvoice.price) || service?.price || 0;
      const discount = Number(newInvoice.discount) || 0;
      const finalAmount = Math.max(0, price - discount);
      
      addInvoice({
          id: `inv_m_${Date.now()}`, userId: newInvoice.userId, dogId: 'GENERAL', serviceId: newInvoice.serviceId,
          amount: price, discount: discount, finalAmount: finalAmount, paidAmount: 0, date: new Date().toLocaleDateString('fa-IR'), dueDate: newInvoice.dueDate, status: InvoiceStatus.PENDING
      });
      setShowInvoiceModal(false); setNewInvoice({ userId: '', serviceId: '', price: '', dueDate: '', discount: '' });
      alert('فاکتور صادر شد.');
  };

  const handleAddExpense = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newExpense.amount || !newExpense.category) return;
      let relatedEntityId = undefined; let relatedEntityName = undefined;
      if (expenseTargetType === 'User' && expenseTargetId) { const u = users.find(u => u.id === expenseTargetId); relatedEntityId = u?.id; relatedEntityName = u?.name; } 
      else if (expenseTargetType === 'Dog' && expenseTargetId) { const d = dogs.find(d => d.id === expenseTargetId); relatedEntityId = d?.id; relatedEntityName = d?.name; }
      const expenseAcc = accounts.find(a => a.code === newExpense.category);
      addExpense({ id: `exp_m_${Date.now()}`, category: expenseAcc?.code || '6060', amount: Number(newExpense.amount), description: newExpense.description, date: new Date().toLocaleDateString('fa-IR'), relatedEntityId, relatedEntityName });
      setShowExpenseModal(false); setNewExpense({ category: '', amount: '', description: '' }); setExpenseTargetType('General');
      alert('هزینه ثبت شد.');
  };

  const handleAddCheck = (e: React.FormEvent) => { e.preventDefault(); if (!newCheck.amount || !newCheck.checkNumber) return; addCheck({ id: `ch_${Date.now()}`, type: newCheck.type as any, amount: Number(newCheck.amount), checkNumber: newCheck.checkNumber!, bankName: newCheck.bankName!, dueDate: newCheck.dueDate!, issuerOrPayee: newCheck.issuerOrPayee!, status: 'Pending', registeredDate: new Date().toLocaleDateString('fa-IR') }); setShowCheckModal(false); setNewCheck({ type: 'Received', amount: 0, checkNumber: '', bankName: '', dueDate: '', issuerOrPayee: '' }); alert('چک ثبت شد.'); };
  const handleManualEntrySubmit = (e: React.FormEvent) => { e.preventDefault(); const lines: JournalEntryLine[] = manualEntry.lines.map(l => ({ accountId: l.accountId, accountName: accounts.find(a => a.code === l.accountId)?.name || '', debit: Number(l.debit), credit: Number(l.credit) })); const result = recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: manualEntry.description, lines: lines, status: 'POSTED' }); if (result.success) { setShowManualEntryModal(false); setManualEntry({ description: '', lines: [{ accountId: '', debit: '', credit: '' }, { accountId: '', debit: '', credit: '' }] }); alert('سند ثبت شد.'); } else { alert(result.message); } };
  const handleAddAccount = (e: React.FormEvent) => { e.preventDefault(); addAccount({ id: `acc_${Date.now()}`, code: newAccount.code!, name: newAccount.name!, type: newAccount.type as AccountType, isActive: true, parentId: newAccount.parentId || undefined }); setShowAccountModal(false); alert('حساب اضافه شد.'); };
  const handlePayroll = () => { if(confirm('آیا از محاسبه و واریز حقوق ماهانه تمامی پرسنل اطمینان دارید؟')) { const res = processMonthlyPayroll(); alert(`حقوق ${res.count} نفر به مبلغ کل ${new Intl.NumberFormat('fa-IR').format(res.total)} محاسبه و واریز شد.`); } };
  const addLine = () => setManualEntry(prev => ({ ...prev, lines: [...prev.lines, { accountId: '', debit: '', credit: '' }] }));
  const updateLine = (index: number, field: string, value: string) => { const newLines = [...manualEntry.lines]; (newLines[index] as any)[field] = value; setManualEntry({ ...manualEntry, lines: newLines }); };

  const handlePayInvoice = (id: string, method: PaymentMethod) => {
      if (method === PaymentMethod.WALLET) {
          if (!confirm('آیا مطمئن هستید که می‌خواهید مبلغ این فاکتور را از کیف پول کاربر کسر کنید؟')) return;
      }
      const result = payInvoice(id, method);
      if (!result.success) { alert(result.message); } else { alert('پرداخت با موفقیت انجام شد.'); }
  };

  return (
    <div className="space-y-6 pb-20">
       <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
               <div><h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><Scale className="text-blue-600"/> امور مالی و حسابداری</h2><p className="text-sm text-gray-500">مدیریت جریان نقدینگی، فاکتورها و اسناد مالی</p></div>
               {canManageFinance && (<div className="flex flex-wrap gap-3"><button onClick={() => setShowInvoiceModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105"><FileText size={18}/> صدور فاکتور</button><button onClick={() => setShowExpenseModal(true)} className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-700 text-sm font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-105"><TrendingDown size={18}/> ثبت هزینه</button><button onClick={() => setShowCheckModal(true)} className="bg-teal-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-teal-700 text-sm font-bold shadow-lg shadow-teal-600/20 transition-all hover:scale-105"><Receipt size={18}/> ثبت چک</button></div>)}
           </div>
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border dark:border-gray-700"><p className="text-xs text-gray-500 mb-1">درآمد کل</p><h3 className="text-xl font-black text-green-600">{new Intl.NumberFormat('fa-IR').format(financials.totalRevenue)} <span className="text-xs font-normal text-gray-400">تومان</span></h3></div><div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border dark:border-gray-700"><p className="text-xs text-gray-500 mb-1">هزینه‌های جاری</p><h3 className="text-xl font-black text-red-500">{new Intl.NumberFormat('fa-IR').format(financials.totalExpenses)} <span className="text-xs font-normal text-gray-400">تومان</span></h3></div><div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border dark:border-gray-700"><p className="text-xs text-gray-500 mb-1">سود خالص</p><h3 className={`text-xl font-black ${financials.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{new Intl.NumberFormat('fa-IR').format(financials.netProfit)} <span className="text-xs font-normal text-gray-400">تومان</span></h3></div><div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border dark:border-gray-700"><p className="text-xs text-gray-500 mb-1">موجودی نقد و بانک</p><h3 className="text-xl font-black text-teal-600">{new Intl.NumberFormat('fa-IR').format((accountBalances['1011'] || 0) + (accountBalances['1012'] || 0))} <span className="text-xs font-normal text-gray-400">تومان</span></h3></div></div>
       </div>

       <div className="flex border-b dark:border-gray-700 overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm px-2">{[{ id: 'dashboard', label: 'داشبورد و نمودار', icon: <Activity size={18}/> }, { id: 'invoices', label: 'فاکتورها', icon: <FileText size={18}/> }, { id: 'expenses', label: 'هزینه‌ها', icon: <TrendingDown size={18}/> }, { id: 'checks', label: 'چک‌ها', icon: <Receipt size={18}/> }, { id: 'payroll', label: 'حقوق و دستمزد', icon: <Users size={18}/> }, { id: 'accounting', label: 'حسابداری و دفاتر', icon: <Book size={18}/> },].map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-4 text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}>{tab.icon} {tab.label}</button>))}</div>

       {activeTab === 'dashboard' && (
           <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-xl flex items-center justify-between"><div><p className="text-sm text-green-700 dark:text-green-300 font-bold">مجموع موجودی کیف پول کاربران</p><p className="text-xs text-gray-500 mb-1">بدهی باشگاه به اعضا (حساب 2031)</p><h3 className="text-2xl font-black text-green-600">{new Intl.NumberFormat('fa-IR').format(financials.totalWalletLiability)} تومان</h3></div><div className="bg-green-200 dark:bg-green-800 p-3 rounded-full text-green-800 dark:text-green-200"><Wallet size={24}/></div></div><div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-xl flex items-center justify-between"><div><p className="text-sm text-red-700 dark:text-red-300 font-bold">مجموع بدهی کاربران</p><p className="text-xs text-gray-500 mb-1">حساب‌های دریافتنی + فاکتور باز</p><h3 className="text-2xl font-black text-red-600">{new Intl.NumberFormat('fa-IR').format(financials.pendingDebts)} تومان</h3></div><div className="bg-red-200 dark:bg-red-800 p-3 rounded-full text-red-800 dark:text-red-200"><CreditCard size={24}/></div></div></div>
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold mb-6 dark:text-white flex items-center gap-2"><Activity size={20} className="text-blue-600"/> روند درآمد و هزینه (۳۰ روز گذشته)</h3><div className="h-[300px] w-full" dir="ltr"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient><linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} /><XAxis dataKey="name" tick={{fontSize: 10}} /><YAxis tick={{fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#fff'}}/><Legend /><Area type="monotone" dataKey="income" name="درآمد" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" /><Area type="monotone" dataKey="expense" name="هزینه" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" /></AreaChart></ResponsiveContainer></div></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><BarChart2 size={20} className="text-purple-500"/> وضعیت کیف پول کاربران (۱۰ نفر برتر)</h3><div className="h-[300px] w-full" dir="ltr"><ResponsiveContainer width="100%" height="100%"><BarChart data={walletDistribution} layout="vertical" margin={{ left: 40 }}><CartesianGrid strokeDasharray="3 3" opacity={0.1} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{direction: 'rtl', textAlign: 'right', borderRadius: '8px'}} /><Bar dataKey="balance" name="موجودی" barSize={20} radius={[0, 4, 4, 0]}>{walletDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart></ResponsiveContainer></div></div><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center"><h3 className="font-bold mb-4 dark:text-white self-start w-full">دسته‌بندی هزینه‌ها</h3><div className="h-[300px] w-full" dir="ltr"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expenseCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{expenseCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div></div>
           </div>
       )}

       {activeTab === 'invoices' && (
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
               <table className="w-full text-right text-sm">
                   <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="p-4">شماره</th><th className="p-4">کاربر</th><th className="p-4">خدمت</th><th className="p-4">مبلغ کل</th><th className="p-4">پرداختی</th><th className="p-4">وضعیت</th><th className="p-4">تاریخ</th><th className="p-4">عملیات</th></tr></thead>
                   <tbody className="divide-y dark:divide-gray-700">
                       {invoices.map(inv => (
                           <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                               <td className="p-4 font-mono">{inv.id}</td>
                               <td className="p-4 font-medium dark:text-white">{users.find(u => u.id === inv.userId)?.name}</td>
                               <td className="p-4 text-gray-500">{services.find(s => s.id === inv.serviceId)?.name}</td>
                               <td className="p-4 font-bold">{new Intl.NumberFormat('fa-IR').format(inv.finalAmount)}</td>
                               <td className="p-4 text-green-600">{new Intl.NumberFormat('fa-IR').format(inv.paidAmount || 0)}</td>
                               <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${inv.status === InvoiceStatus.PAID ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span></td>
                               <td className="p-4 font-mono text-gray-500">{inv.date}</td>
                               <td className="p-4">
                                   {inv.status !== InvoiceStatus.PAID && canManageFinance && (
                                       <div className="flex gap-2">
                                           <button onClick={() => handlePayInvoice(inv.id, PaymentMethod.WALLET)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">کیف پول</button>
                                           <button onClick={() => handlePayInvoice(inv.id, PaymentMethod.CARD)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">کارتخوان</button>
                                       </div>
                                   )}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}

       {activeTab === 'expenses' && (
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
               <table className="w-full text-right text-sm">
                   <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="p-4">دسته‌بندی</th><th className="p-4">مبلغ</th><th className="p-4">توضیحات</th><th className="p-4">مرتبط با</th><th className="p-4">تاریخ</th></tr></thead>
                   <tbody className="divide-y dark:divide-gray-700">
                       {expenses.map(exp => (
                           <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                               <td className="p-4"><span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs border border-red-100">{exp.category}</span></td>
                               <td className="p-4 font-bold text-gray-800 dark:text-white">{new Intl.NumberFormat('fa-IR').format(exp.amount)}</td>
                               <td className="p-4 text-gray-500">{exp.description}</td>
                               <td className="p-4 text-xs text-blue-600">{exp.relatedEntityName || '-'}</td>
                               <td className="p-4 font-mono text-gray-500">{exp.date}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}

       {activeTab === 'checks' && (
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
               <table className="w-full text-right text-sm">
                   <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="p-4">نوع</th><th className="p-4">مبلغ</th><th className="p-4">شماره چک</th><th className="p-4">بانک</th><th className="p-4">تاریخ سررسید</th><th className="p-4">صادرکننده/دریافت کننده</th><th className="p-4">وضعیت</th><th className="p-4">عملیات</th></tr></thead>
                   <tbody className="divide-y dark:divide-gray-700">
                       {checks.map(check => (
                           <tr key={check.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                               <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${check.type === 'Received' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{check.type === 'Received' ? 'دریافتی' : 'پرداختی'}</span></td>
                               <td className="p-4 font-bold">{new Intl.NumberFormat('fa-IR').format(check.amount)}</td>
                               <td className="p-4 font-mono">{check.checkNumber}</td>
                               <td className="p-4">{check.bankName}</td>
                               <td className="p-4 font-mono">{check.dueDate}</td>
                               <td className="p-4">{check.issuerOrPayee}</td>
                               <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${check.status === 'Cleared' ? 'bg-green-100 text-green-700' : check.status === 'Bounced' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{check.status === 'Cleared' ? 'پاس شده' : check.status === 'Bounced' ? 'برگشت خورده' : 'در جریان'}</span></td>
                               <td className="p-4">
                                   {check.status === 'Pending' && canManageFinance && (
                                       <div className="flex gap-2">
                                           <button onClick={() => updateCheckStatus(check.id, 'Cleared')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">پاس</button>
                                           <button onClick={() => updateCheckStatus(check.id, 'Bounced')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">برگشت</button>
                                       </div>
                                   )}
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       )}

       {activeTab === 'payroll' && (
           <div className="space-y-4">
               <div className="flex justify-end"><button onClick={handlePayroll} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 shadow-lg flex items-center gap-2"><Users size={18}/> محاسبه و واریز حقوق ماهانه</button></div>
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center text-gray-500">لیست فیش‌های حقوقی صادر شده در اینجا نمایش داده می‌شود.</div>
           </div>
       )}

       {activeTab === 'accounting' && (
           <div className="space-y-4">
               <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border dark:border-gray-700 w-fit"><button onClick={() => setAccountingSubTab('journal')} className={`px-4 py-2 rounded-lg text-xs font-bold ${accountingSubTab === 'journal' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-500'}`}>دفتر روزنامه</button><button onClick={() => setAccountingSubTab('ledger')} className={`px-4 py-2 rounded-lg text-xs font-bold ${accountingSubTab === 'ledger' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-500'}`}>دفتر کل</button><button onClick={() => setAccountingSubTab('trial')} className={`px-4 py-2 rounded-lg text-xs font-bold ${accountingSubTab === 'trial' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-500'}`}>تراز آزمایشی</button><button onClick={() => setAccountingSubTab('coa')} className={`px-4 py-2 rounded-lg text-xs font-bold ${accountingSubTab === 'coa' ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-500'}`}>کدینگ حساب‌ها</button></div>
               <div className="flex justify-end gap-2"><button onClick={() => setShowManualEntryModal(true)} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-900">ثبت سند دستی</button><button onClick={() => setShowAccountModal(true)} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200">تعریف حساب</button></div>
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                   {accountingSubTab === 'journal' && (
                       <table className="w-full text-right text-xs">
                           <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="p-3">شماره سند</th><th className="p-3">تاریخ</th><th className="p-3">شرح</th><th className="p-3">حساب</th><th className="p-3">بدهکار</th><th className="p-3">بستانکار</th><th className="p-3">عملیات</th></tr></thead>
                           <tbody className="divide-y dark:divide-gray-700">{journalEntries.map(entry => (
                               <React.Fragment key={entry.id}>
                                   {entry.lines.map((line, idx) => (
                                       <tr key={`${entry.id}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                           {idx === 0 && (<><td className="p-3 font-mono border-l dark:border-gray-700" rowSpan={entry.lines.length}>{entry.documentNumber}</td><td className="p-3 font-mono" rowSpan={entry.lines.length}>{entry.date}</td><td className="p-3" rowSpan={entry.lines.length}>{entry.description}</td></>)}
                                           <td className="p-3 border-r dark:border-gray-700"><span className="font-mono text-gray-400 mr-1">{line.accountId}</span> {line.accountName}</td>
                                           <td className="p-3 font-mono">{line.debit > 0 ? new Intl.NumberFormat('fa-IR').format(line.debit) : ''}</td>
                                           <td className="p-3 font-mono">{line.credit > 0 ? new Intl.NumberFormat('fa-IR').format(line.credit) : ''}</td>
                                           {idx === 0 && <td className="p-3 text-center" rowSpan={entry.lines.length}>{isAdmin && <button onClick={() => deleteJournalEntry(entry.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>}</td>}
                                       </tr>
                                   ))}
                                   <tr className="bg-gray-50 dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-600"><td colSpan={7} className="h-1"></td></tr>
                               </React.Fragment>
                           ))}</tbody>
                       </table>
                   )}
                   {accountingSubTab === 'ledger' && (
                       <div className="p-4">
                           <div className="mb-4"><label className="text-xs text-gray-500 ml-2">انتخاب حساب معین:</label><select className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={selectedAccountCode} onChange={e => setSelectedAccountCode(e.target.value)}><option value="">انتخاب کنید...</option>{accounts.map(a => <option key={a.id} value={a.code}>{a.code} - {a.name}</option>)}</select></div>
                           {selectedAccountCode ? (
                               <table className="w-full text-right text-xs border dark:border-gray-700"><thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-2">تاریخ</th><th className="p-2">شرح</th><th className="p-2">سند</th><th className="p-2">بدهکار</th><th className="p-2">بستانکار</th><th className="p-2">مانده</th></tr></thead><tbody>{ledgerData.map((row, i) => (<tr key={i} className="border-b dark:border-gray-700"><td className="p-2">{row.date}</td><td className="p-2">{row.description}</td><td className="p-2">{row.documentNumber}</td><td className="p-2">{row.debit > 0 ? row.debit.toLocaleString() : ''}</td><td className="p-2">{row.credit > 0 ? row.credit.toLocaleString() : ''}</td><td className="p-2 font-bold dir-ltr text-right">{row.balance.toLocaleString()}</td></tr>))}</tbody></table>
                           ) : <p className="text-center text-gray-400">یک حساب را انتخاب کنید.</p>}
                       </div>
                   )}
               </div>
           </div>
       )}

       {/* Modals */}
       {showInvoiceModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full animate-fade-in"><h3 className="font-bold mb-4 dark:text-white">صدور فاکتور جدید</h3><form onSubmit={handleAddInvoice} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">کاربر</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newInvoice.userId} onChange={e => setNewInvoice({...newInvoice, userId: e.target.value})}><option value="">انتخاب کنید...</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div><div><label className="block text-xs mb-1 dark:text-gray-300">خدمت</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newInvoice.serviceId} onChange={e => setNewInvoice({...newInvoice, serviceId: e.target.value})}><option value="">انتخاب کنید...</option>{services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price})</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">مبلغ نهایی</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newInvoice.price} onChange={e => setNewInvoice({...newInvoice, price: e.target.value})} placeholder="پیش‌فرض سرویس" /></div><div><label className="block text-xs mb-1 dark:text-gray-300">تخفیف</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newInvoice.discount} onChange={e => setNewInvoice({...newInvoice, discount: e.target.value})} /></div></div><button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">صدور</button><button type="button" onClick={() => setShowInvoiceModal(false)} className="w-full py-2 text-gray-500">انصراف</button></form></div></div>)}
       {showExpenseModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full animate-fade-in"><h3 className="font-bold mb-4 dark:text-white">ثبت هزینه جدید</h3><form onSubmit={handleAddExpense} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">دسته‌بندی (سرفصل حساب)</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}><option value="">انتخاب کنید...</option>{accounts.filter(a => a.type === 'Expense').map(a => <option key={a.id} value={a.code}>{a.name}</option>)}</select></div><div><label className="block text-xs mb-1 dark:text-gray-300">مبلغ (تومان)</label><input type="number" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">توضیحات</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">مرتبط با (اختیاری)</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={expenseTargetType} onChange={e => setExpenseTargetType(e.target.value as any)}><option value="General">عمومی</option><option value="User">کاربر / پرسنل</option><option value="Dog">سگ</option></select></div>{expenseTargetType !== 'General' && (<div><label className="block text-xs mb-1 dark:text-gray-300">انتخاب مورد</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={expenseTargetId} onChange={e => setExpenseTargetId(e.target.value)}>{expenseTargetType === 'User' ? users.map(u => <option key={u.id} value={u.id}>{u.name}</option>) : dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>)}</div>{expenseTargetType === 'User' && (<div className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4"/><span className="text-xs text-gray-500">واریز به کیف پول شخص (بستانکار کردن کاربر)</span></div>)}<button type="submit" className="w-full py-3 bg-red-600 text-white rounded-lg font-bold">ثبت هزینه</button><button type="button" onClick={() => setShowExpenseModal(false)} className="w-full py-2 text-gray-500">انصراف</button></form></div></div>)}
       {showCheckModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full animate-fade-in"><h3 className="font-bold mb-4 dark:text-white">ثبت چک جدید</h3><form onSubmit={handleAddCheck} className="space-y-4"><div className="flex gap-4"><label><input type="radio" checked={newCheck.type === 'Received'} onChange={() => setNewCheck({...newCheck, type: 'Received'})} /> دریافتی</label><label><input type="radio" checked={newCheck.type === 'Paid'} onChange={() => setNewCheck({...newCheck, type: 'Paid'})} /> پرداختی</label></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">مبلغ</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newCheck.amount} onChange={e => setNewCheck({...newCheck, amount: Number(e.target.value)})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">شماره چک</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newCheck.checkNumber} onChange={e => setNewCheck({...newCheck, checkNumber: e.target.value})} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">بانک</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newCheck.bankName} onChange={e => setNewCheck({...newCheck, bankName: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">تاریخ سررسید</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newCheck.dueDate} onChange={e => setNewCheck({...newCheck, dueDate: e.target.value})} placeholder="1403/01/01" /></div></div><div><label className="block text-xs mb-1 dark:text-gray-300">{newCheck.type === 'Received' ? 'صادر کننده (مشتری)' : 'در وجه (گیرنده)'}</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newCheck.issuerOrPayee} onChange={e => setNewCheck({...newCheck, issuerOrPayee: e.target.value})} /></div><button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold">ثبت چک</button><button type="button" onClick={() => setShowCheckModal(false)} className="w-full py-2 text-gray-500">انصراف</button></form></div></div>)}
       {showManualEntryModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full animate-fade-in"><h3 className="font-bold mb-4 dark:text-white">ثبت سند حسابداری دستی</h3><form onSubmit={handleManualEntrySubmit} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">شرح سند</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={manualEntry.description} onChange={e => setManualEntry({...manualEntry, description: e.target.value})} required /></div><div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border dark:border-gray-700"><div className="flex justify-between mb-2 text-xs text-gray-500 px-2"><span>حساب معین</span><span className="w-24 text-center">بدهکار</span><span className="w-24 text-center">بستانکار</span></div>{manualEntry.lines.map((line, i) => (<div key={i} className="flex gap-2 mb-2"><select className="flex-1 p-2 rounded border dark:bg-gray-600 dark:text-white text-xs" value={line.accountId} onChange={e => updateLine(i, 'accountId', e.target.value)} required><option value="">انتخاب حساب...</option>{accounts.map(a => <option key={a.id} value={a.code}>{a.code} - {a.name}</option>)}</select><input type="number" className="w-24 p-2 rounded border dark:bg-gray-600 dark:text-white text-xs" placeholder="0" value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)} /><input type="number" className="w-24 p-2 rounded border dark:bg-gray-600 dark:text-white text-xs" placeholder="0" value={line.credit} onChange={e => updateLine(i, 'credit', e.target.value)} /></div>))}<button type="button" onClick={addLine} className="text-xs text-blue-600 flex items-center gap-1 mt-2"><Plus size={12}/> افزودن ردیف</button></div><button type="submit" className="w-full py-3 bg-gray-800 text-white rounded-lg font-bold">ثبت سند</button><button type="button" onClick={() => setShowManualEntryModal(false)} className="w-full py-2 text-gray-500">انصراف</button></form></div></div>)}
       {showAccountModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in"><h3 className="font-bold mb-4 dark:text-white">تعریف حساب جدید</h3><form onSubmit={handleAddAccount} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">کد حساب</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newAccount.code} onChange={e => setNewAccount({...newAccount, code: e.target.value})} required /></div><div><label className="block text-xs mb-1 dark:text-gray-300">عنوان حساب</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} required /></div><div><label className="block text-xs mb-1 dark:text-gray-300">نوع حساب</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value as AccountType})}><option value="Asset">دارایی</option><option value="Liability">بدهی</option><option value="Equity">سرمایه</option><option value="Revenue">درآمد</option><option value="Expense">هزینه</option></select></div><button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">ذخیره</button><button type="button" onClick={() => setShowAccountModal(false)} className="w-full py-2 text-gray-500">انصراف</button></form></div></div>)}
    </div>
  );
};
