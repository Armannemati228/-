
import * as React from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Dog, Service, Invoice, Expense, FinancialSummary, InvoiceStatus, UserRole, WalletTransaction, TransactionType, PaymentGatewaySettings, PaymentMethod, Room, DailyLog, DogStatus, TrainingSession, ServiceRequest, Ticket, AIConfig, AssignedTrainer, UserPermissions, ManagerTask, DailyChecklist, EmergencyReport, InventoryItem, InventoryTransaction, SystemLog, TreatmentPlan, PurchaseRequest, PrescriptionItem, JournalEntry, Account, JournalEntryLine, Check, Payslip, Reminder, SMSConfig, HostConfig, SystemBackup } from '../types';
import { MOCK_USERS, MOCK_DOGS, MOCK_SERVICES, MOCK_INVOICES, MOCK_EXPENSES, MOCK_ROOMS, MOCK_INVENTORY, DEFAULT_ACCOUNTS, MOCK_CHECKS } from '../constants';

interface AppContextType {
  users: User[];
  dogs: Dog[];
  services: Service[];
  invoices: Invoice[];
  expenses: Expense[];
  transactions: WalletTransaction[];
  rooms: Room[];
  financials: FinancialSummary;
  darkMode: boolean;
  currentUser: User | null;
  gatewaySettings: PaymentGatewaySettings;
  canEdit: boolean;
  canManageFinance: boolean;
  canViewReports: boolean; 
  tickets: Ticket[];
  aiConfig: AIConfig;
  reminders: Reminder[];
  smsConfig: SMSConfig;
  hostConfig: HostConfig;
  
  managerTasks: ManagerTask[];
  dailyChecklists: DailyChecklist[];
  emergencyReports: EmergencyReport[];
  systemLogs: SystemLog[];
  feedingResponsibleRole: UserRole;

  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  productionTolerance: number; 

  activeTreatments: TreatmentPlan[];
  purchaseRequests: PurchaseRequest[];

  accounts: Account[];
  journalEntries: JournalEntry[];
  checks: Check[];
  payslips: Payslip[];

  toggleDarkMode: () => void;
  login: (phone: string) => boolean;
  register: (user: User) => void;
  updateProfile: (user: Partial<User>) => void;
  updateUser: (user: User) => void;
  updateUserPermissions: (userId: string, permissions: UserPermissions) => void;
  logout: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  addExpense: (expense: Expense) => void;
  addDog: (dog: Dog) => void;
  updateDog: (dog: Dog) => void;
  addUser: (user: User) => void;
  
  payInvoice: (invoiceId: string, method: PaymentMethod, amount?: number, rechargeAmount?: number) => { success: boolean; message: string };
  processPayout: (userId: string, amount: number, type: TransactionType, description: string) => void;
  adminUpdateWallet: (userId: string, amount: number, type: TransactionType, description: string) => void;
  chargeWallet: (amount: number) => void;
  processMonthlyPayroll: () => { count: number; total: number }; 
  updateGatewaySettings: (settings: PaymentGatewaySettings) => void;
  updateSMSConfig: (config: SMSConfig) => void;
  updateHostConfig: (config: HostConfig) => void;
  getDogFinancialStatus: (dogId: string) => { totalDebt: number; isCleared: boolean };
  
  addCheck: (check: Check) => void;
  updateCheckStatus: (checkId: string, newStatus: Check['status']) => void;

  addReminder: (reminder: Reminder) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  
  admitDog: (dogId: string, status: DogStatus, roomId: string, admissionDate: string, checkoutDate: string, selectedServices: string[], contractNumber: string, contractImage: string, downPayment: number, discount: number, paymentMethod: PaymentMethod) => void;
  changeDogRoom: (dogId: string, newRoomId: string) => void;
  addDailyLog: (dogId: string, log: DailyLog) => void;
  dischargeDog: (dogId: string, photo: string, recipientName: string, actualDate: string) => void;
  
  addTrainerToDog: (dogId: string, trainerId: string, specialty: string, commissionPercentage: number, servicePrice: number) => void;
  removeTrainerFromDog: (dogId: string, trainerId: string) => void;
  
  addTrainingSession: (dogId: string, session: TrainingSession) => void;
  finishTraining: (dogId: string) => void;
  approveTrainingCompletion: (dogId: string) => void;
  
  requestService: (request: ServiceRequest) => void;
  approveServiceRequest: (requestId: string, dogId: string) => void;

  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticket: Ticket) => void;
  updateAIConfig: (config: AIConfig) => void;

  addManagerTask: (task: ManagerTask) => void;
  removeManagerTask: (taskId: string) => void;
  submitChecklist: (checklist: DailyChecklist) => void;
  verifyChecklist: (checklistId: string) => void;
  addEmergencyReport: (report: EmergencyReport) => void;
  assignEmergencyReport: (reportId: string, userId: string, userName: string, adminNote: string) => void;
  resolveEmergencyReport: (reportId: string) => void;
  setFeedingResponsibleRole: (role: UserRole) => void; 

  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void; 
  updateStock: (itemId: string, quantity: number, type: 'IN' | 'OUT', description?: string, dogId?: string, unitPrice?: number) => void;
  produceFoodBatch: (ingredients: { itemId: string; quantity: number }[], totalWeight: number) => void;
  setProductionTolerance: (value: number) => void;
  checkMissedMeals: () => void;

  createTreatmentPlan: (plan: TreatmentPlan) => void;
  approveTreatmentPlan: (planId: string) => void;
  rejectTreatmentPlan: (planId: string) => void;
  administerMedication: (planId: string, medId: string) => void;
  finalizeTreatmentOutcome: (planId: string, outcome: 'CURED' | 'NOT_CURED' | 'PARTIAL', notes: string) => void;
  fulfillPurchaseRequest: (requestId: string) => void;
  getDailyMedicalTasks: () => { dog: Dog, meds: PrescriptionItem[], planId: string, isFinished?: boolean }[];

  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  recordJournalEntry: (entry: Omit<JournalEntry, 'id' | 'documentNumber' | 'createdAt' | 'createdBy'>) => { success: boolean; message: string };
  deleteJournalEntry: (id: string) => void;

  addSystemLog: (category: SystemLog['category'], action: string, description: string) => void;
  
  createBackup: () => void;
  restoreBackup: (file: File) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getDefaultPermissions = (roles: UserRole[]): UserPermissions => {
  const perms: UserPermissions = {
    accessDashboard: true, manageDogs: false, manageFinance: false, manageUsers: false, manageMedical: false, manageRooms: false, viewReports: false, manageInventory: false, log_food: false, log_medical: false, log_training: false, log_activity: false,
  };
  if (roles.includes(UserRole.ADMIN)) return { accessDashboard: true, manageDogs: true, manageFinance: true, manageUsers: true, manageMedical: true, manageRooms: true, viewReports: true, manageInventory: true, log_food: true, log_medical: true, log_training: true, log_activity: true };
  if (roles.includes(UserRole.INTERNAL_MANAGER)) return { accessDashboard: true, manageDogs: true, manageFinance: false, manageUsers: true, manageMedical: false, manageRooms: true, viewReports: true, manageInventory: true, log_food: true, log_medical: false, log_training: false, log_activity: true };
  if (roles.includes(UserRole.VET)) return { accessDashboard: true, manageDogs: true, manageFinance: false, manageUsers: false, manageMedical: true, manageRooms: false, viewReports: true, manageInventory: false, log_food: true, log_medical: true, log_training: false, log_activity: false };
  if (roles.includes(UserRole.RECEPTIONIST)) return { accessDashboard: true, manageDogs: true, manageFinance: false, manageUsers: true, manageMedical: false, manageRooms: true, viewReports: false, manageInventory: false, log_food: true, log_medical: false, log_training: false, log_activity: true };
  if (roles.includes(UserRole.ACCOUNTANT)) return { accessDashboard: true, manageDogs: false, manageFinance: true, manageUsers: false, manageMedical: false, manageRooms: false, viewReports: true, manageInventory: false, log_food: false, log_medical: false, log_training: false, log_activity: false };
  if (roles.includes(UserRole.STAFF)) return { accessDashboard: true, manageDogs: true, manageFinance: false, manageUsers: false, manageMedical: false, manageRooms: true, viewReports: false, manageInventory: false, log_food: true, log_medical: false, log_training: false, log_activity: true };
  if (roles.includes(UserRole.TRAINER)) return { accessDashboard: true, manageDogs: true, manageFinance: false, manageUsers: false, manageMedical: false, manageRooms: false, viewReports: false, manageInventory: false, log_food: false, log_medical: false, log_training: true, log_activity: true };
  if (roles.includes(UserRole.CLIENT)) return { accessDashboard: true, manageDogs: false, manageFinance: false, manageUsers: false, manageMedical: false, manageRooms: false, viewReports: false, manageInventory: false, log_food: false, log_medical: false, log_training: false, log_activity: false };
  return perms;
};

// STORAGE KEYS
const STORAGE_KEYS = {
  USERS: 'mr_rottweiler_users',
  DOGS: 'mr_rottweiler_dogs',
  INVOICES: 'mr_rottweiler_invoices',
  EXPENSES: 'mr_rottweiler_expenses',
  LOGS: 'mr_rottweiler_logs',
  CHECKLISTS: 'mr_rottweiler_checklists',
  JOURNAL: 'mr_rottweiler_journal',
  INVENTORY: 'mr_rottweiler_inventory'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fallback to Mocks
  const loadState = <T,>(key: string, fallback: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  };

  const [users, setUsers] = useState<User[]>(() => loadState(STORAGE_KEYS.USERS, MOCK_USERS));
  const [dogs, setDogs] = useState<Dog[]>(() => loadState(STORAGE_KEYS.DOGS, MOCK_DOGS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadState(STORAGE_KEYS.INVOICES, MOCK_INVOICES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadState(STORAGE_KEYS.EXPENSES, MOCK_EXPENSES));
  const [dailyChecklists, setDailyChecklists] = useState<DailyChecklist[]>(() => loadState(STORAGE_KEYS.CHECKLISTS, []));
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => loadState(STORAGE_KEYS.LOGS, []));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadState(STORAGE_KEYS.INVENTORY, MOCK_INVENTORY));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadState(STORAGE_KEYS.JOURNAL, []));

  // Other states (less critical for persistence or dynamic)
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const [managerTasks, setManagerTasks] = useState<ManagerTask[]>([ { id: 'mt1', title: 'بررسی نظافت اتاق‌ها', category: 'Sanitation', isEnabled: true }, { id: 'mt2', title: 'چک کردن موجودی غذای خشک', category: 'Logistics', isEnabled: true }, ]);
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>([]);
  const [feedingResponsibleRole, setFeedingResponsibleRoleState] = useState<UserRole>(UserRole.STAFF);

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [productionTolerance, setProductionTolerance] = useState(5); 

  const [activeTreatments, setActiveTreatments] = useState<TreatmentPlan[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);

  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [checks, setChecks] = useState<Check[]>(MOCK_CHECKS);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  const [gatewaySettings, setGatewaySettings] = useState<PaymentGatewaySettings>({ isEnabled: false, merchantId: '', apiKey: '', callbackUrl: 'https://dogclub.ir/verify' });
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({ isEnabled: false, provider: 'KavehNegar', apiKey: '', senderLine: '', patternCode: '' }); 
  const [hostConfig, setHostConfig] = useState<HostConfig>({ domain: '', host: '', port: '21', username: '', password: '', protocol: 'FTP' });
  const [aiConfig, setAiConfig] = useState<AIConfig>({ apiKey: '', model: 'gemini-1.5-flash', isEnabled: false });

  // Persistence Effects
  useEffect(() => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.DOGS, JSON.stringify(dogs)), [dogs]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(dailyChecklists)), [dailyChecklists]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(systemLogs)), [systemLogs]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journalEntries)), [journalEntries]);

  useEffect(() => { if (darkMode) { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); } }, [darkMode]);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addSystemLog = (category: SystemLog['category'], action: string, description: string) => {
      const newLog: SystemLog = { id: `log_${Date.now()}_${Math.random()}`, category, action, description, performedBy: currentUser?.name || 'سیستم', userId: currentUser?.id, userRole: currentUser?.roles?.join(', '), timestamp: new Date().toLocaleString('fa-IR') };
      setSystemLogs(prev => [newLog, ...prev]);
  };

  const addAccount = (account: Account) => setAccounts(prev => [...prev, account]);
  const updateAccount = (account: Account) => setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  const recordJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'documentNumber' | 'createdAt' | 'createdBy'>): { success: boolean; message: string } => {
      const totalDebit = entryData.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = entryData.lines.reduce((sum, line) => sum + line.credit, 0);
      if (Math.abs(totalDebit - totalCredit) > 0.01) return { success: false, message: `سند تراز نیست! جمع بدهکار: ${totalDebit} - جمع بستانکار: ${totalCredit}` };
      const newEntry: JournalEntry = { id: `je_${Date.now()}_${Math.random()}`, documentNumber: journalEntries.length + 1001, createdAt: new Date().toLocaleString('fa-IR'), createdBy: currentUser?.name || 'System', status: 'POSTED', ...entryData };
      setJournalEntries(prev => [newEntry, ...prev]);
      addSystemLog('Finance', 'JOURNAL_ENTRY', `ثبت سند حسابداری شماره ${newEntry.documentNumber}: ${newEntry.description}`);
      return { success: true, message: 'سند حسابداری با موفقیت ثبت شد.' };
  };
  const deleteJournalEntry = (id: string) => { if (!currentUser?.roles.includes(UserRole.ADMIN)) return; setJournalEntries(prev => prev.filter(e => e.id !== id)); addSystemLog('Finance', 'JOURNAL_DELETE', `حذف سند شماره ${id}`); };

  const login = (phone: string) => { const user = users.find(u => u.phone === phone); if (user) { if (!user.permissions) user.permissions = getDefaultPermissions(user.roles); setCurrentUser(user); if (reminders.length === 0) setReminders([{ id: 'r1', userId: user.id, title: 'بررسی گزارش‌های روزانه', dueDate: new Date().toLocaleDateString('fa-IR'), isCompleted: false, createdAt: new Date().toISOString() }]); return true; } return false; };
  const register = (user: User) => { user.permissions = getDefaultPermissions(user.roles); setUsers(prev => [...prev, user]); setCurrentUser(user); addSystemLog('User', 'REGISTER', `کاربر جدید ثبت نام کرد: ${user.name}`); };
  const updateProfile = (updatedData: Partial<User>) => { if (!currentUser) return; const updatedUser = { ...currentUser, ...updatedData }; setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u)); setCurrentUser(updatedUser); };
  const updateUser = (updatedUser: User) => { setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u)); if (currentUser && currentUser.id === updatedUser.id) setCurrentUser(updatedUser); addSystemLog('User', 'UPDATE_USER', `ویرایش اطلاعات کاربر: ${updatedUser.name}`); };
  const updateUserPermissions = (userId: string, permissions: UserPermissions) => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions } : u)); if (currentUser && currentUser.id === userId) setCurrentUser({ ...currentUser, permissions }); addSystemLog('System', 'PERMISSIONS_UPDATE', `تغییر دسترسی‌های کاربر ID: ${userId}`); };
  const logout = () => { setCurrentUser(null); };

  const canEdit = useMemo(() => { if (!currentUser) return false; return currentUser.permissions?.manageDogs || false; }, [currentUser]);
  const canManageFinance = useMemo(() => { if (!currentUser) return false; return currentUser.permissions?.manageFinance || false; }, [currentUser]);
  const canViewReports = useMemo(() => { if (!currentUser) return false; return currentUser.permissions?.viewReports || false; }, [currentUser]);
  
  const financials = useMemo(() => { 
      const totalRevenue = invoices.filter(inv => inv.status === InvoiceStatus.PAID).reduce((acc, curr) => acc + curr.finalAmount, 0); 
      const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0); 
      const netProfit = totalRevenue - totalExpenses; 
      const unpaidInvoicesDebt = invoices.filter(inv => inv.status !== InvoiceStatus.PAID).reduce((acc, curr) => acc + (curr.finalAmount - (curr.paidAmount || 0)), 0); 
      const walletDebt = users.filter(u => u.balance < 0).reduce((acc, curr) => acc + curr.balance, 0); 
      const totalWalletLiability = users.filter(u => u.balance > 0).reduce((acc, curr) => acc + curr.balance, 0); 
      return { totalRevenue, totalExpenses, netProfit, pendingDebts: unpaidInvoicesDebt + Math.abs(walletDebt), totalWalletLiability, monthlyGrowth: 12.5, emergencyFund: 50000000 }; 
  }, [invoices, expenses, users]);

  const addInvoice = (invoice: Invoice) => {
      if (!invoice.dueDate) { const parts = invoice.date.split('/'); let y = parseInt(parts[0]); let m = parseInt(parts[1]); let d = parseInt(parts[2]) + 7; if (d > 30) { d -= 30; m++; } if (m > 12) { m = 1; y++; } invoice.dueDate = `${y}/${m < 10 ? '0'+m : m}/${d < 10 ? '0'+d : d}`; }
      if (invoice.paidAmount === undefined) invoice.paidAmount = 0;
      setInvoices(prev => [invoice, ...prev]);
      let revenueCode = '4050'; const service = services.find(s => s.id === invoice.serviceId); if (service) { if (service.category === 'Training') revenueCode = '4010'; else if (service.category === 'Boarding') revenueCode = '4020'; else if (service.category === 'Medical') revenueCode = '4030'; else if (service.category === 'Grooming') revenueCode = '4040'; } else if (invoice.serviceId === 'MULTI') { revenueCode = '4010'; }
      recordJournalEntry({ date: invoice.date, description: `صدور فاکتور #${invoice.id} برای ${users.find(u=>u.id===invoice.userId)?.name} - سرویس: ${invoice.serviceName || service?.name}`, reference: invoice.id, status: 'POSTED', lines: [ { accountId: '1021', accountName: 'بدهکاران تجاری (مشتریان)', debit: invoice.finalAmount, credit: 0 }, { accountId: revenueCode, accountName: accounts.find(a=>a.code===revenueCode)?.name || 'درآمد', debit: 0, credit: invoice.finalAmount } ] });
  };
  const updateInvoice = (invoice: Invoice) => setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
  const addExpense = (expense: Expense) => {
      setExpenses(prev => [expense, ...prev]);
      let expenseCode = '6060'; if (expense.category === 'حقوق') expenseCode = '6010'; else if (expense.category === 'اجاره') expenseCode = '6020'; else if (expense.category === 'خوراک') expenseCode = '6030'; else if (expense.category === 'تعمیرات') expenseCode = '6040'; else if (expense.category === 'تبلیغات') expenseCode = '6050'; if(accounts.some(a => a.code === expense.category)) expenseCode = expense.category;
      recordJournalEntry({ date: expense.date, description: `هزینه: ${expense.description}` + (expense.relatedEntityName ? ` (مربوط به: ${expense.relatedEntityName})` : ''), reference: expense.id, relatedEntityId: expense.relatedEntityId, relatedEntityName: expense.relatedEntityName, status: 'POSTED', lines: [ { accountId: expenseCode, accountName: accounts.find(a=>a.code===expenseCode)?.name || 'هزینه', debit: expense.amount, credit: 0 }, { accountId: '1011', accountName: 'صندوق مرکزی', debit: 0, credit: expense.amount } ] });
  };
  const payInvoice = (invoiceId: string, method: PaymentMethod, amount?: number, rechargeAmount?: number) => { 
      const invoice = invoices.find(inv => inv.id === invoiceId); 
      if(!invoice) return { success: false, message: 'فاکتور یافت نشد' }; 
      if(invoice.status === InvoiceStatus.PAID) return { success: false, message: 'این فاکتور قبلاً تسویه شده است' };
      const paymentAmount = amount || (invoice.finalAmount - (invoice.paidAmount || 0));
      if (paymentAmount <= 0) return { success: false, message: 'مبلغ پرداخت نامعتبر است' };
      const user = users.find(u => u.id === invoice.userId); 
      if (!user) return { success: false, message: 'کاربر یافت نشد' };
      let currentBalance = user.balance;
      const newTransactions: WalletTransaction[] = [];
      const newJournalEntries: Omit<JournalEntry, 'id' | 'documentNumber' | 'createdAt' | 'createdBy'>[] = [];
      if (rechargeAmount && rechargeAmount > 0) { currentBalance += rechargeAmount; newTransactions.push({ id: `txn_rc_${Date.now()}`, userId: user.id, amount: rechargeAmount, type: TransactionType.DEPOSIT, description: 'شارژ آنلاین کیف پول (خودکار)', date: new Date().toLocaleDateString('fa-IR'), isCredit: true }); newJournalEntries.push({ date: new Date().toLocaleDateString('fa-IR'), description: `شارژ آنلاین کیف پول توسط ${user.name}`, status: 'POSTED', lines: [ { accountId: '1012', accountName: 'بانک ملی', debit: rechargeAmount, credit: 0 }, { accountId: '2031', accountName: 'کیف پول کاربران', debit: 0, credit: rechargeAmount } ] }); }
      if (method === PaymentMethod.WALLET && currentBalance < paymentAmount) { return { success: false, message: 'موجودی کیف پول کافی نیست. لطفا حساب خود را شارژ کنید.' }; }
      let debitAccount = '1011'; let creditAccount = '1021'; let description = `دریافت وجه بابت فاکتور #${invoice.id}`;
      if (method === PaymentMethod.WALLET) { currentBalance -= paymentAmount; debitAccount = '2031'; description = `پرداخت فاکتور #${invoice.id} از کیف پول`; newTransactions.push({ id: `txn_py_${Date.now()}`, userId: user.id, amount: paymentAmount, type: TransactionType.PAYMENT, description, date: new Date().toLocaleDateString('fa-IR'), isCredit: false }); } else if (method === PaymentMethod.ONLINE || method === PaymentMethod.CARD) { debitAccount = '1012'; }
      newJournalEntries.push({ date: invoice.date, description, reference: invoice.id, status: 'POSTED', lines: [ { accountId: debitAccount, accountName: accounts.find(a=>a.code===debitAccount)?.name || 'وجه نقد/بانک/کیف پول', debit: paymentAmount, credit: 0 }, { accountId: creditAccount, accountName: 'بدهکاران تجاری (مشتریان)', debit: 0, credit: paymentAmount } ] });
      setTransactions(prev => [...newTransactions, ...prev]); newJournalEntries.forEach(entry => recordJournalEntry(entry));
      const finalBalance = currentBalance; setUsers(prev => prev.map(u => u.id === user.id ? { ...u, balance: finalBalance } : u)); if (currentUser && currentUser.id === user.id) { setCurrentUser(prev => prev ? { ...prev, balance: finalBalance } : null); }
      const newPaidAmount = (invoice.paidAmount || 0) + paymentAmount; const isFullyPaid = newPaidAmount >= invoice.finalAmount - 100; 
      if (invoice.providerId && isFullyPaid) { const provider = users.find(u => u.id === invoice.providerId); const service = services.find(s => s.id === invoice.serviceId); if (provider && service) { let commPercent = service.defaultCommission || 0; if (provider.commissionOverrides && provider.commissionOverrides[service.category]) { commPercent = provider.commissionOverrides[service.category]; } if (commPercent > 0) { const commAmount = (invoice.finalAmount * commPercent) / 100; processPayout(provider.id, commAmount, TransactionType.COMMISSION, `پورسانت فاکتور #${invoice.id}`); } } }
      updateInvoice({ ...invoice, paidAmount: newPaidAmount, status: isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PENDING, paymentMethod: method }); return { success: true, message: 'پرداخت با موفقیت ثبت شد' }; 
  };
  const processPayout = (userId: string, amount: number, type: TransactionType, description: string) => { setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: u.balance + amount } : u)); if (currentUser && currentUser.id === userId) { setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null); } setTransactions(prev => [{ id: `txn_${Date.now()}`, userId, amount, type, description, date: new Date().toLocaleDateString('fa-IR'), isCredit: true }, ...prev]); let expenseCode = '6010'; if (type === TransactionType.COMMISSION) expenseCode = '6011'; recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `شارژ کیف پول: ${description} (${users.find(u=>u.id===userId)?.name})`, reference: userId, status: 'POSTED', lines: [ { accountId: expenseCode, accountName: accounts.find(a=>a.code===expenseCode)?.name || 'هزینه', debit: amount, credit: 0 }, { accountId: '2031', accountName: 'کیف پول کاربران', debit: 0, credit: amount } ] }); };
  const adminUpdateWallet = (userId: string, amount: number, type: TransactionType, description: string) => { let finalAmount = amount; let isCred = true; if (type === TransactionType.WITHDRAWAL) { finalAmount = -amount; isCred = false; } setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: u.balance + finalAmount } : u)); if (currentUser && currentUser.id === userId) { setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + finalAmount } : null); } setTransactions(prev => [{ id: `txn_${Date.now()}`, userId, amount: Math.abs(amount), type, description, date: new Date().toLocaleDateString('fa-IR'), isCredit: isCred }, ...prev]); if (isCred) { recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `افزایش دستی اعتبار: ${description}`, status: 'POSTED', lines: [ { accountId: '6060', accountName: 'هزینه ملزومات/سایر', debit: amount, credit: 0 }, { accountId: '2031', accountName: 'کیف پول کاربران', debit: 0, credit: amount } ] }); } else { recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `کاهش دستی اعتبار/تسویه: ${description}`, status: 'POSTED', lines: [ { accountId: '2031', accountName: 'کیف پول کاربران', debit: amount, credit: 0 }, { accountId: '1011', accountName: 'صندوق مرکزی', debit: 0, credit: amount } ] }); } };
  const chargeWallet = (amount: number) => { if (!currentUser) return; setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, balance: u.balance + amount } : u)); setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null); setTransactions(prev => [{ id: `txn_${Date.now()}`, userId: currentUser.id, amount, type: TransactionType.DEPOSIT, description: 'شارژ آنلاین کیف پول', date: new Date().toLocaleDateString('fa-IR'), isCredit: true }, ...prev]); recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `شارژ آنلاین کیف پول توسط ${currentUser.name}`, status: 'POSTED', lines: [ { accountId: '1012', accountName: 'بانک ملی', debit: amount, credit: 0 }, { accountId: '2031', accountName: 'کیف پول کاربران', debit: 0, credit: amount } ] }); };
  const processMonthlyPayroll = () => { let count = 0; let total = 0; const newTxns: WalletTransaction[] = []; const updatedUsers = users.map(u => { if (u.baseSalary && u.baseSalary > 0) { count++; total += u.baseSalary; newTxns.push({ id: `sal_${Date.now()}_${u.id}`, userId: u.id, amount: u.baseSalary, type: TransactionType.SALARY, description: 'حقوق ماهانه', date: new Date().toLocaleDateString('fa-IR'), isCredit: true }); return { ...u, balance: u.balance + u.baseSalary }; } return u; }); if (count > 0) { setUsers(updatedUsers); if (currentUser && currentUser.baseSalary && currentUser.baseSalary > 0) setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + (prev.baseSalary || 0) } : null); setTransactions(prev => [...newTxns, ...prev]); recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `حقوق ماهانه ${count} نفر پرسنل`, status: 'POSTED', lines: [ { accountId: '6010', accountName: 'هزینه حقوق و دستمزد', debit: total, credit: 0 }, { accountId: '2031', accountName: 'کیف پول کاربران', debit: 0, credit: total } ] }); } return { count, total }; };
  const addCheck = (check: Check) => { setChecks(prev => [check, ...prev]); if (check.type === 'Received') { recordJournalEntry({ date: check.registeredDate, description: `دریافت چک شماره ${check.checkNumber} از ${check.issuerOrPayee}`, reference: check.checkNumber, status: 'POSTED', lines: [ { accountId: '1031', accountName: 'چک‌های دریافتنی', debit: check.amount, credit: 0 }, { accountId: '1021', accountName: 'بدهکاران تجاری', debit: 0, credit: check.amount } ] }); } else { recordJournalEntry({ date: check.registeredDate, description: `صدور چک شماره ${check.checkNumber} در وجه ${check.issuerOrPayee}`, reference: check.checkNumber, status: 'POSTED', lines: [ { accountId: '2011', accountName: 'بستانکاران تجاری', debit: check.amount, credit: 0 }, { accountId: '2021', accountName: 'چک‌های پرداختی', debit: 0, credit: check.amount } ] }); } };
  const updateCheckStatus = (checkId: string, status: Check['status']) => { const check = checks.find(c => c.id === checkId); if (!check) return; setChecks(prev => prev.map(c => c.id === checkId ? { ...c, status } : c)); if (status === 'Cleared') { if (check.type === 'Received') { recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `وصول چک شماره ${check.checkNumber}`, reference: check.checkNumber, status: 'POSTED', lines: [ { accountId: '1012', accountName: 'بانک ملی', debit: check.amount, credit: 0 }, { accountId: '1031', accountName: 'چک‌های دریافتنی', debit: 0, credit: check.amount } ] }); } else { recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `پاس شدن چک صادره ${check.checkNumber}`, reference: check.checkNumber, status: 'POSTED', lines: [ { accountId: '2021', accountName: 'چک‌های پرداختی', debit: check.amount, credit: 0 }, { accountId: '1012', accountName: 'بانک ملی', debit: 0, credit: check.amount } ] }); } } };
  
  const addDog = (dog: Dog) => { setDogs(prev => [dog, ...prev]); addSystemLog('Operation', 'ADD_DOG', `ثبت سگ جدید: ${dog.name}`); };
  const updateDog = (dog: Dog) => { setDogs(prev => prev.map(d => d.id === dog.id ? dog : d)); addSystemLog('Operation', 'UPDATE_DOG', `ویرایش اطلاعات سگ: ${dog.name}`); };
  const addUser = (user: User) => { user.permissions = getDefaultPermissions(user.roles); setUsers(prev => [user, ...prev]); addSystemLog('User', 'ADD_USER_ADMIN', `افزودن کاربر توسط مدیر: ${user.name}`); };
  const updateGatewaySettings = (settings: PaymentGatewaySettings) => setGatewaySettings(settings);
  const updateSMSConfig = (config: SMSConfig) => setSmsConfig(config);
  const updateHostConfig = (config: HostConfig) => setHostConfig(config);
  const getDogFinancialStatus = (dogId: string) => { const dogInvoices = invoices.filter(i => i.dogId === dogId); const totalDebt = dogInvoices.filter(i => i.status !== InvoiceStatus.PAID).reduce((acc, curr) => acc + (curr.finalAmount - (curr.paidAmount || 0)), 0); return { totalDebt, isCleared: totalDebt === 0 }; };
  const addReminder = (reminder: Reminder) => setReminders(prev => [reminder, ...prev]);
  const toggleReminder = (id: string) => setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  const deleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));
  
  const admitDog = (dogId: string, status: DogStatus, roomId: string, admissionDate: string, checkoutDate: string, selectedServices: string[], contractNumber: string, contractImage: string, downPayment: number, discount: number, paymentMethod: PaymentMethod) => { setDogs(prev => prev.map(d => d.id === dogId ? { ...d, status, roomId, admissionDate, checkoutDate, contractNumber, contractImage } : d)); setRooms(prev => prev.map(r => r.id === roomId ? { ...r, occupiedBy: [...r.occupiedBy, dogId] } : r)); const dog = dogs.find(d => d.id === dogId); const relevantServices = services.filter(s => selectedServices.includes(s.id)); const totalAmount = relevantServices.reduce((sum, s) => sum + s.price, 0); const serviceNames = relevantServices.map(s => s.name).join(' + '); const finalAmount = Math.max(0, totalAmount - discount); const invoiceId = `inv_adm_${Date.now()}`; const parts = admissionDate.split('/'); let y = parseInt(parts[0]); let m = parseInt(parts[1]); let d = parseInt(parts[2]) + 7; if (d > 30) { d -= 30; m++; } if (m > 12) { m = 1; y++; } const defaultDueDate = `${y}/${m < 10 ? '0'+m : m}/${d < 10 ? '0'+d : d}`; const invoice: Invoice = { id: invoiceId, userId: dog?.ownerId || '', dogId: dogId, serviceId: 'MULTI', serviceName: serviceNames, amount: totalAmount, discount: discount, finalAmount: finalAmount, paidAmount: 0, date: admissionDate, dueDate: defaultDueDate, status: InvoiceStatus.PENDING, downPayment: downPayment, paymentMethod: paymentMethod }; addInvoice(invoice); if (downPayment > 0) { const result = payInvoice(invoiceId, paymentMethod, downPayment); if (!result.success) { console.warn('Downpayment failed', result.message); } } addSystemLog('Operation', 'ADMIT', `پذیرش سگ ${dog?.name} با قرارداد شماره ${contractNumber} و تخفیف ${discount}`); };
  const changeDogRoom = (dogId: string, newRoomId: string) => { const dog = dogs.find(d => d.id === dogId); if (dog && dog.roomId) { setRooms(prev => prev.map(r => r.id === dog.roomId ? { ...r, occupiedBy: r.occupiedBy.filter(id => id !== dogId) } : r)); } setRooms(prev => prev.map(r => r.id === newRoomId ? { ...r, occupiedBy: [...r.occupiedBy, dogId] } : r)); setDogs(prev => prev.map(d => d.id === dogId ? { ...d, roomId: newRoomId } : d)); };
  const dischargeDog = (dogId: string, photo: string, recipientName: string, actualDate: string) => { const dog = dogs.find(d => d.id === dogId); if (dog && dog.roomId) { setRooms(prev => prev.map(r => r.id === dog.roomId ? { ...r, occupiedBy: r.occupiedBy.filter(id => id !== dogId) } : r)); } setDogs(prev => prev.map(d => d.id === dogId ? { ...d, status: DogStatus.CHECKED_OUT, roomId: undefined, dischargePhoto: photo, deliveryRecipient: recipientName, actualCheckoutDate: actualDate } : d)); addSystemLog('Operation', 'DISCHARGE', `ترخیص سگ ${dogId}`); };
  const addTrainerToDog = (dogId: string, trainerId: string, specialty: string, commission: number, servicePrice: number) => { const trainer = users.find(u => u.id === trainerId); if (!trainer) return; const assignment: AssignedTrainer = { trainerId, trainerName: trainer.name, specialty, commission, assignedDate: new Date().toLocaleDateString('fa-IR') }; setDogs(prev => prev.map(d => d.id === dogId ? { ...d, trainers: [...(d.trainers || []), assignment] } : d)); };
  const removeTrainerFromDog = (dogId: string, trainerId: string) => { setDogs(prev => prev.map(d => d.id === dogId ? { ...d, trainers: (d.trainers || []).filter(t => t.trainerId !== trainerId) } : d)); };
  const addTrainingSession = (dogId: string, session: TrainingSession) => { setDogs(prev => prev.map(d => d.id === dogId ? { ...d, trainingSessions: [...(d.trainingSessions || []), session] } : d)); };
  const finishTraining = (dogId: string) => { setDogs(prev => prev.map(d => d.id === dogId ? { ...d, trainingFinishedDate: new Date().toLocaleDateString('fa-IR') } : d)); addSystemLog('Operation', 'TRAINING_FINISH', `اعلام اتمام دوره آموزشی سگ ${dogId} توسط مربی`); };
  const approveTrainingCompletion = (dogId: string) => { setDogs(prev => prev.map(d => d.id === dogId ? { ...d, status: DogStatus.BOARDING, trainingApprovedDate: new Date().toLocaleDateString('fa-IR') } : d)); addSystemLog('Operation', 'TRAINING_APPROVE', `تایید اتمام دوره آموزشی سگ ${dogId} توسط مدیر`); };
  const requestService = (request: ServiceRequest) => { setDogs(prev => prev.map(d => d.id === request.dogId ? { ...d, serviceRequests: [...(d.serviceRequests || []), request] } : d)); };
  const approveServiceRequest = (requestId: string, dogId: string) => { setDogs(prev => prev.map(d => d.id === dogId ? { ...d, serviceRequests: (d.serviceRequests || []).map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r) } : d)); };
  
  const addRoom = (room: Room) => setRooms(prev => [...prev, room]);
  const removeRoom = (roomId: string) => setRooms(prev => prev.filter(r => r.id !== roomId));
  const addService = (service: Service) => setServices(prev => [...prev, service]);
  const updateService = (service: Service) => setServices(prev => prev.map(s => s.id === service.id ? service : s));
  const removeService = (serviceId: string) => setServices(prev => prev.filter(s => s.id !== serviceId));
  const addTicket = (ticket: Ticket) => setTickets(prev => [ticket, ...prev]);
  const updateTicket = (ticket: Ticket) => setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
  const updateAIConfig = (config: AIConfig) => setAiConfig(config);
  const addManagerTask = (task: ManagerTask) => setManagerTasks(prev => [...prev, task]);
  const removeManagerTask = (taskId: string) => setManagerTasks(prev => prev.filter(t => t.id !== taskId));
  const submitChecklist = (checklist: DailyChecklist) => setDailyChecklists(prev => [checklist, ...prev]);
  const verifyChecklist = (checklistId: string) => {
      setDailyChecklists(prev => prev.map(c => c.id === checklistId ? { ...c, verifiedByAdmin: true } : c));
      addSystemLog('Operation', 'CHECKLIST_VERIFY', `تایید و بایگانی گزارش روزانه شناسه ${checklistId}`);
  };
  const addEmergencyReport = (report: EmergencyReport) => { setEmergencyReports(prev => [report, ...prev]); addSystemLog('Emergency', 'REPORT', `گزارش اضطراری: ${report.title}`); };
  const assignEmergencyReport = (reportId: string, userId: string, userName: string, adminNote: string) => { setEmergencyReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'ASSIGNED', assignedToId: userId, assignedToName: userName, adminNote } : r)); };
  const resolveEmergencyReport = (reportId: string) => { setEmergencyReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'RESOLVED', resolvedAt: new Date().toLocaleString('fa-IR') } : r)); };
  const setFeedingResponsibleRole = (role: UserRole) => setFeedingResponsibleRoleState(role); 
  
  const addInventoryItem = (item: InventoryItem) => setInventory(prev => [...prev, item]);
  
  const updateInventoryItem = (updatedItem: InventoryItem) => {
      setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
      addSystemLog('Operation', 'UPDATE_INVENTORY', `ویرایش کالا: ${updatedItem.name}`);
  };

  const updateStock = (itemId: string, quantity: number, type: 'IN' | 'OUT', description?: string, dogId?: string, unitPrice?: number) => {
      setInventory(prev => prev.map(i => {
          if (i.id === itemId) {
              const newQty = type === 'IN' ? i.quantity + quantity : i.quantity - quantity;
              let newAvgCost = i.averageCost;
              if (type === 'IN' && unitPrice && unitPrice > 0) {
                  const currentTotalValue = i.quantity * i.averageCost;
                  const incomingTotalValue = quantity * unitPrice;
                  if (newQty > 0) { newAvgCost = (currentTotalValue + incomingTotalValue) / newQty; }
              }
              return { ...i, quantity: Math.max(0, newQty), averageCost: newAvgCost };
          }
          return i;
      }));
      const item = inventory.find(i => i.id === itemId);
      const transactionPrice = unitPrice ? unitPrice : (item ? item.averageCost : 0);
      const totalTransactionValue = quantity * transactionPrice;
      const txn: InventoryTransaction = { id: `inv_txn_${Date.now()}_${Math.random()}`, itemId, itemName: item?.name || '', type, quantity, unitPrice: transactionPrice, totalPrice: totalTransactionValue, date: new Date().toLocaleString('fa-IR'), userId: currentUser?.id || 'sys', userName: currentUser?.name || 'System', description, relatedDogId: dogId };
      setInventoryTransactions(prev => [txn, ...prev]);
      if (type === 'IN' && unitPrice && totalTransactionValue > 0) {
          let debitAcc = '1043'; if (item?.category === 'Food') debitAcc = '1041'; else if (item?.category === 'Medical') debitAcc = '1042';
          recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `خرید کالا: ${item?.name} (${quantity} ${item?.unit}) - فی: ${new Intl.NumberFormat('fa-IR').format(unitPrice)}`, reference: `PUR-${Date.now()}`, status: 'POSTED', lines: [ { accountId: debitAcc, accountName: 'موجودی کالا', debit: totalTransactionValue, credit: 0 }, { accountId: '1011', accountName: 'صندوق مرکزی', debit: 0, credit: totalTransactionValue } ] });
      }
  };

  const addDailyLog = (dogId: string, log: DailyLog) => { 
      setDogs(prev => prev.map(d => d.id === dogId ? { ...d, logs: [log, ...(d.logs || [])] } : d)); 
      const allEntries = [...(log.foodEntries || []), ...(log.medicalEntries || [])];
      allEntries.forEach(entry => {
          if (entry.inventoryItemId && entry.quantityUsed) {
              const item = inventory.find(i => i.id === entry.inventoryItemId);
              if (item) {
                  let consumedQty = entry.quantityUsed;
                  if (item.category === 'Food' && entry.weight && item.unit === 'کیلوگرم') { consumedQty = entry.weight / 1000; }
                  const cost = consumedQty * item.averageCost;
                  if (cost > 0) {
                      let expenseAcc = '6060'; let creditAcc = '1043';
                      if (item.category === 'Food') { expenseAcc = '6030'; creditAcc = '1041'; }
                      else if (item.category === 'Medical') { expenseAcc = '6031'; creditAcc = '1042'; }
                      updateStock(item.id, consumedQty, 'OUT', `مصرف روزانه برای ${dogId}`, dogId); 
                      recordJournalEntry({ date: log.date, description: `هزینه مصرفی: ${item.name} برای سگ ${dogs.find(d=>d.id===dogId)?.name}`, relatedEntityId: dogId, relatedEntityName: dogs.find(d=>d.id===dogId)?.name, status: 'POSTED', lines: [ { accountId: expenseAcc, accountName: 'هزینه عملیاتی (COGS)', debit: cost, credit: 0 }, { accountId: creditAcc, accountName: 'موجودی انبار', debit: 0, credit: cost } ] });
                  }
              }
          }
      });
  };

  const produceFoodBatch = (ingredients: { itemId: string; quantity: number }[], totalWeight: number) => { 
      let totalCost = 0; ingredients.forEach(ing => { const item = inventory.find(i => i.id === ing.itemId); if (item) { const cost = ing.quantity * item.averageCost; totalCost += cost; updateStock(ing.itemId, ing.quantity, 'OUT', 'تولید غذا'); } }); 
      const cooked = inventory.find(i => i.name === 'غذای پخته روزانه');
      const unitCost = totalWeight > 0 ? totalCost / totalWeight : 0;
      if (cooked) { updateStock(cooked.id, totalWeight, 'IN', 'تولید غذا', undefined, unitCost); }
      addSystemLog('Operation', 'FOOD_PRODUCTION', `تولید ${totalWeight.toFixed(2)}kg غذا با هزینه مواد اولیه ${new Intl.NumberFormat('fa-IR').format(totalCost)}`);
  };

  const administerMedication = (planId: string, medId: string) => { 
      setActiveTreatments(prev => prev.map(p => p.id === planId ? { ...p, medications: p.medications.map(m => m.id === medId ? { ...m, administeredCount: (m.administeredCount || 0) + 1 } : m) } : p)); 
      const plan = activeTreatments.find(p => p.id === planId);
      const med = plan?.medications.find(m => m.id === medId);
      if (plan && med && med.inventoryItemId) {
          const item = inventory.find(i => i.id === med.inventoryItemId);
          if (item) {
              const cost = med.dosageQuantity * item.averageCost;
              updateStock(item.id, med.dosageQuantity, 'OUT', `مصرف دارو برای ${plan.dogId}`, plan.dogId);
              recordJournalEntry({ date: new Date().toLocaleDateString('fa-IR'), description: `هزینه درمان: ${med.name} برای ${dogs.find(d=>d.id===plan.dogId)?.name}`, relatedEntityId: plan.dogId, relatedEntityName: dogs.find(d=>d.id===plan.dogId)?.name, status: 'POSTED', lines: [ { accountId: '6031', accountName: 'هزینه دارو و درمان', debit: cost, credit: 0 }, { accountId: '1042', accountName: 'انبار دارو', debit: 0, credit: cost } ] });
          }
      }
  };

  const checkMissedMeals = () => {}; 
  const createTreatmentPlan = (plan: TreatmentPlan) => { setActiveTreatments(prev => [plan, ...prev]); plan.medications.filter(m=>m.needsPurchase).forEach(m => setPurchaseRequests(prev=>[...prev, {id:`pr_${Date.now()}`, itemName:m.name, quantity: m.totalDoses||1, status:'PENDING', requestedBy: plan.vetId, requestDate: new Date().toLocaleDateString('fa-IR'), reason:'تجویز'}])); };
  const approveTreatmentPlan = (planId: string) => setActiveTreatments(prev => prev.map(t => t.id === planId ? { ...t, approvalStatus: 'APPROVED' } : t));
  const rejectTreatmentPlan = (planId: string) => setActiveTreatments(prev => prev.map(t => t.id === planId ? { ...t, approvalStatus: 'REJECTED' } : t));
  const finalizeTreatmentOutcome = (planId: string, outcome: 'CURED' | 'NOT_CURED' | 'PARTIAL', notes: string) => { setActiveTreatments(prev => prev.map(t => t.id === planId ? { ...t, status: 'COMPLETED', treatmentOutcome: outcome, outcomeNotes: notes } : t)); };
  const fulfillPurchaseRequest = (requestId: string) => setPurchaseRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'PURCHASED' } : r));
  const getDailyMedicalTasks = () => {
      const active = activeTreatments.filter(plan => plan.status === 'ACTIVE' && plan.approvalStatus === 'APPROVED');
      const tasks: { dog: Dog, meds: PrescriptionItem[], planId: string, isFinished?: boolean }[] = [];
      active.forEach(plan => {
          const dog = dogs.find(d => d.id === plan.dogId);
          if (dog) {
              const meds = plan.medications.filter(m => (m.administeredCount || 0) < (m.totalDoses || 100));
              const isFinished = meds.length === 0;
              tasks.push({ dog, meds, planId: plan.id, isFinished });
          }
      });
      return tasks;
  };

  const createBackup = () => {
    const backup: SystemBackup = {
      metadata: { timestamp: new Date().toISOString(), version: '1.0.0', exportedBy: currentUser?.name || 'System' },
      data: { users, dogs, services, invoices, expenses, transactions, rooms, tickets, reminders, managerTasks, dailyChecklists, emergencyReports, systemLogs, inventory, inventoryTransactions, activeTreatments, purchaseRequests, accounts, journalEntries, checks, payslips, settings: { gateway: gatewaySettings, sms: smsConfig, host: hostConfig, ai: aiConfig, productionTolerance } }
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `backup_mr_rottweiler_${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    addSystemLog('System', 'BACKUP_CREATE', 'ایجاد نسخه پشتیبان از کل سیستم');
  };

  const restoreBackup = async (file: File) => {
    try {
      const text = await file.text(); const backup: SystemBackup = JSON.parse(text); if (!backup.data) throw new Error('Invalid backup format');
      setUsers(backup.data.users || []); setDogs(backup.data.dogs || []); setServices(backup.data.services || []); setInvoices(backup.data.invoices || []); setExpenses(backup.data.expenses || []); setTransactions(backup.data.transactions || []); setRooms(backup.data.rooms || []); setTickets(backup.data.tickets || []); setReminders(backup.data.reminders || []); setManagerTasks(backup.data.managerTasks || []); setDailyChecklists(backup.data.dailyChecklists || []); setEmergencyReports(backup.data.emergencyReports || []); setSystemLogs(backup.data.systemLogs || []); setInventory(backup.data.inventory || []); setInventoryTransactions(backup.data.inventoryTransactions || []); setActiveTreatments(backup.data.activeTreatments || []); setPurchaseRequests(backup.data.purchaseRequests || []); setAccounts(backup.data.accounts || []); setJournalEntries(backup.data.journalEntries || []); setChecks(backup.data.checks || []); setPayslips(backup.data.payslips || []);
      if (backup.data.settings) { setGatewaySettings(backup.data.settings.gateway); setSmsConfig(backup.data.settings.sms); setHostConfig(backup.data.settings.host); setAiConfig(backup.data.settings.ai); setProductionTolerance(backup.data.settings.productionTolerance); }
      addSystemLog('System', 'BACKUP_RESTORE', `بازگردانی نسخه پشتیبان از تاریخ ${backup.metadata.timestamp}`); alert('اطلاعات با موفقیت بازگردانی شد. صفحه رفرش می‌شود.'); window.location.reload();
    } catch (error) { console.error(error); alert('خطا در بازگردانی فایل. لطفا از معتبر بودن فایل اطمینان حاصل کنید.'); }
  };

  return (
    <AppContext.Provider value={{
      users, dogs, services, invoices, expenses, transactions, rooms, financials, darkMode, currentUser,
      gatewaySettings, canEdit, canManageFinance, canViewReports, tickets, aiConfig, reminders, smsConfig, hostConfig,
      managerTasks, dailyChecklists, emergencyReports, systemLogs, feedingResponsibleRole,
      inventory, inventoryTransactions, productionTolerance, activeTreatments, purchaseRequests,
      accounts, journalEntries, checks, payslips,
      toggleDarkMode, login, register, updateProfile, updateUser, updateUserPermissions, logout,
      addInvoice, updateInvoice, addExpense, addDog, updateDog, addUser,
      payInvoice, processPayout, adminUpdateWallet, chargeWallet, processMonthlyPayroll,
      updateGatewaySettings, updateSMSConfig, updateHostConfig, getDogFinancialStatus, addCheck, updateCheckStatus,
      addReminder, toggleReminder, deleteReminder,
      admitDog, changeDogRoom, addDailyLog, dischargeDog,
      addTrainerToDog, removeTrainerFromDog,
      addTrainingSession, finishTraining, approveTrainingCompletion,
      requestService, approveServiceRequest,
      addRoom, removeRoom, addService, updateService, removeService,
      addTicket, updateTicket, updateAIConfig,
      addManagerTask, removeManagerTask, submitChecklist, verifyChecklist,
      addEmergencyReport, assignEmergencyReport, resolveEmergencyReport, setFeedingResponsibleRole,
      addInventoryItem, updateInventoryItem, updateStock, produceFoodBatch, setProductionTolerance, checkMissedMeals,
      createTreatmentPlan, approveTreatmentPlan, rejectTreatmentPlan, administerMedication, finalizeTreatmentOutcome, fulfillPurchaseRequest, getDailyMedicalTasks,
      addAccount, updateAccount, recordJournalEntry, deleteJournalEntry, addSystemLog,
      createBackup, restoreBackup
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
