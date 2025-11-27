
import { Dog, DogStatus, Expense, Invoice, InvoiceStatus, Service, User, UserRole, Room, UserPermissions, InventoryItem, Account, Check } from "./types";

export const APP_LOGO = "https://fal.media/files/penguin/M0bFjFpE6_3q8H2SgD7W__1000000113.png";

const DEFAULT_PERMISSIONS: UserPermissions = {
  accessDashboard: true,
  manageDogs: false,
  manageFinance: false,
  manageUsers: false,
  manageMedical: false,
  manageRooms: false,
  viewReports: false,
  manageInventory: false,
  log_food: false,
  log_medical: false,
  log_training: false,
  log_activity: false
};

const createPerms = (overrides: Partial<UserPermissions>): UserPermissions => ({ ...DEFAULT_PERMISSIONS, ...overrides });

// --- STANDARD CHART OF ACCOUNTS FOR DOG CLUB ---
export const DEFAULT_ACCOUNTS: Account[] = [
  // 1. ASSETS (دارایی‌ها)
  { id: 'a1', code: '10', name: 'دارایی‌های جاری', type: 'Asset', isActive: true },
  { id: 'a2', code: '1010', name: 'موجودی نقد و بانک', type: 'Asset', parentId: 'a1', isActive: true },
  { id: '1011', code: '1011', name: 'صندوق مرکزی', type: 'Asset', parentId: 'a2', isActive: true },
  { id: '1012', code: '1012', name: 'بانک ملی', type: 'Asset', parentId: 'a2', isActive: true },
  { id: 'a3', code: '1020', name: 'حساب‌های دریافتنی', type: 'Asset', parentId: 'a1', isActive: true },
  { id: '1021', code: '1021', name: 'بدهکاران تجاری (مشتریان)', type: 'Asset', parentId: 'a3', isActive: true },
  { id: 'a4', code: '1030', name: 'اسناد دریافتنی', type: 'Asset', parentId: 'a1', isActive: true },
  { id: '1031', code: '1031', name: 'چک‌های دریافتنی', type: 'Asset', parentId: 'a4', isActive: true },
  { id: 'a5', code: '1040', name: 'موجودی کالا', type: 'Asset', parentId: 'a1', isActive: true },
  { id: '1041', code: '1041', name: 'انبار غذا', type: 'Asset', parentId: 'a5', isActive: true },
  { id: '1042', code: '1042', name: 'انبار دارو', type: 'Asset', parentId: 'a5', isActive: true },
  { id: '1043', code: '1043', name: 'انبار تجهیزات', type: 'Asset', parentId: 'a5', isActive: true },

  // 2. LIABILITIES (بدهی‌ها)
  { id: 'l1', code: '20', name: 'بدهی‌های جاری', type: 'Liability', isActive: true },
  { id: 'l2', code: '2010', name: 'حساب‌های پرداختنی', type: 'Liability', parentId: 'l1', isActive: true },
  { id: '2011', code: '2011', name: 'بستانکاران تجاری (تامین کنندگان)', type: 'Liability', parentId: 'l2', isActive: true },
  { id: 'l3', code: '2020', name: 'اسناد پرداختنی', type: 'Liability', parentId: 'l1', isActive: true },
  { id: '2021', code: '2021', name: 'چک‌های پرداختی', type: 'Liability', parentId: 'l3', isActive: true },
  { id: 'l4', code: '2030', name: 'پیش‌دریافت‌ها', type: 'Liability', parentId: 'l1', isActive: true },
  { id: '2031', code: '2031', name: 'کیف پول کاربران (بدهی به اعضا)', type: 'Liability', parentId: 'l4', isActive: true },
  { id: 'l5', code: '2040', name: 'حقوق پرداختنی', type: 'Liability', parentId: 'l1', isActive: true },

  // 3. EQUITY (سرمایه)
  { id: 'eq1', code: '30', name: 'حقوق صاحبان سهام', type: 'Equity', isActive: true },
  { id: '3010', code: '3010', name: 'سرمایه اولیه', type: 'Equity', parentId: 'eq1', isActive: true },
  { id: '3020', code: '3020', name: 'سود/زیان انباشته', type: 'Equity', parentId: 'eq1', isActive: true },

  // 4. REVENUE (درآمدها)
  { id: 'r1', code: '40', name: 'درآمدهای عملیاتی', type: 'Revenue', isActive: true },
  { id: '4010', code: '4010', name: 'درآمد آموزش', type: 'Revenue', parentId: 'r1', isActive: true },
  { id: '4020', code: '4020', name: 'درآمد پانسیون', type: 'Revenue', parentId: 'r1', isActive: true },
  { id: '4030', code: '4030', name: 'درآمد خدمات پزشکی', type: 'Revenue', parentId: 'r1', isActive: true },
  { id: '4040', code: '4040', name: 'درآمد اصلاح و شستشو', type: 'Revenue', parentId: 'r1', isActive: true },
  { id: '4050', code: '4050', name: 'فروش کالا و غذا', type: 'Revenue', parentId: 'r1', isActive: true },

  // 6. EXPENSES (هزینه‌ها)
  { id: 'ex1', code: '60', name: 'هزینه‌های عملیاتی', type: 'Expense', isActive: true },
  { id: '6010', code: '6010', name: 'هزینه حقوق و دستمزد', type: 'Expense', parentId: 'ex1', isActive: true },
  { id: '6011', code: '6011', name: 'هزینه پورسانت مربیان', type: 'Expense', parentId: 'ex1', isActive: true },
  { id: '6020', code: '6020', name: 'هزینه اجاره', type: 'Expense', parentId: 'ex1', isActive: true },
  { id: '6030', code: '6030', name: 'هزینه خوراک سگ‌ها (COGS)', type: 'Expense', parentId: 'ex1', isActive: true },
  { id: '6031', code: '6031', name: 'هزینه دارو و درمان (COGS)', type: 'Expense', parentId: 'ex1', isActive: true },
  { id: '6040', code: '6040', name: 'هزینه تعمیرات و نگهداری', type: 'Expense', parentId: 'ex1', isActive: true },
  { id: '6050', code: '6050', name: 'هزینه تبلیغات', type: 'Expense', parentId: 'ex1', isActive: true },
  { id: '6060', code: '6060', name: 'هزینه ملزومات مصرفی', type: 'Expense', parentId: 'ex1', isActive: true },
];

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', name: 'علی رضایی', roles: [UserRole.ADMIN], phone: '09121111111', balance: 0, joinedDate: '1402/01/01', avatar: 'https://i.pravatar.cc/150?u=u1',
    permissions: createPerms({ manageDogs: true, manageFinance: true, manageUsers: true, manageMedical: true, manageRooms: true, viewReports: true, manageInventory: true, log_food: true, log_medical: true, log_training: true, log_activity: true })
  },
  { 
    id: 'u2', name: 'دکتر سارا محمدی', roles: [UserRole.VET], phone: '09122222222', balance: 0, joinedDate: '1402/02/15', avatar: 'https://i.pravatar.cc/150?u=u2',
    permissions: createPerms({ manageMedical: true, manageDogs: true, viewReports: true, log_food: true, log_medical: true })
  },
  { 
    id: 'u3', name: 'رضا کاظمی', roles: [UserRole.CLIENT], phone: '09123333333', balance: 1500000, joinedDate: '1402/05/20', avatar: 'https://i.pravatar.cc/150?u=u3',
    permissions: createPerms({})
  },
  { 
    id: 'u4', name: 'مهندس کریمی', roles: [UserRole.INTERNAL_MANAGER], phone: '09124444444', balance: 0, joinedDate: '1402/06/10', avatar: 'https://i.pravatar.cc/150?u=u4',
    permissions: createPerms({ manageDogs: true, manageRooms: true, manageUsers: true, viewReports: true, manageInventory: true, log_food: true, log_activity: true })
  },
  { 
    id: 'u5', name: 'امید نوری', roles: [UserRole.ACCOUNTANT], phone: '09125555555', balance: 0, joinedDate: '1402/01/05', avatar: 'https://i.pravatar.cc/150?u=u5',
    permissions: createPerms({ manageFinance: true, viewReports: true })
  },
  { 
    id: 'u6', name: 'کاوه کیانی', roles: [UserRole.TRAINER], phone: '09126666666', balance: 0, joinedDate: '1402/03/01', avatar: 'https://i.pravatar.cc/150?u=u6',
    permissions: createPerms({ manageDogs: true, log_training: true, log_activity: true })
  },
  { 
    id: 'u7', name: 'نازنین افشار', roles: [UserRole.CLIENT, UserRole.BREEDER], phone: '09127777777', balance: -500000, joinedDate: '1402/07/12', avatar: 'https://i.pravatar.cc/150?u=u7',
    permissions: createPerms({})
  },
  { 
    id: 'u8', name: 'خانم جلالی', roles: [UserRole.RECEPTIONIST], phone: '09128888888', balance: 0, joinedDate: '1402/08/25', avatar: 'https://i.pravatar.cc/150?u=u8',
    permissions: createPerms({ manageDogs: true, manageRooms: true, manageInventory: false, log_food: true, log_activity: true })
  },
  { 
    id: 'u9', name: 'الهام حسینی', roles: [UserRole.STAFF], phone: '09129999999', balance: 0, joinedDate: '1402/04/10', avatar: 'https://i.pravatar.cc/150?u=u9',
    permissions: createPerms({ manageDogs: true, manageRooms: true, log_food: true, log_activity: true })
  },
  { 
    id: 'u10', name: 'پدرام صادقی', roles: [UserRole.CLIENT], phone: '09351111111', balance: 0, joinedDate: '1402/09/05', avatar: 'https://i.pravatar.cc/150?u=u10',
    permissions: createPerms({})
  },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'r1', name: 'قفس ۱۰۱', capacity: 1, occupiedBy: [], type: 'Standard' },
  { id: 'r2', name: 'قفس ۱۰۲', capacity: 1, occupiedBy: [], type: 'Standard' },
  { id: 'r3', name: 'اتاق VIP ۱', capacity: 2, occupiedBy: ['d3'], type: 'VIP' },
  { id: 'r4', name: 'قرنطینه A', capacity: 1, occupiedBy: ['d5'], type: 'Isolation' },
  { id: 'r5', name: 'سالن آموزش ۱', capacity: 5, occupiedBy: ['d1'], type: 'Standard' },
];

export const MOCK_DOGS: Dog[] = [
  { id: 'd1', ownerId: 'u3', name: 'راکی', breed: 'ژرمن شپرد', age: 3, status: DogStatus.IN_TRAINING, lastVaccine: '1402/10/01', nextCheckup: '1403/02/01', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=400', microchip: '982009100', roomId: 'r5', admissionDate: '1402/12/01', logs: [], trainers: [] },
  { id: 'd2', ownerId: 'u3', name: 'لوسی', breed: 'پامرانین', age: 2, status: DogStatus.HEALTHY, lastVaccine: '1402/09/15', nextCheckup: '1403/03/15', image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=400', logs: [] },
  { id: 'd3', ownerId: 'u4', name: 'مکس', breed: 'گلدن رتریور', age: 5, status: DogStatus.BOARDING, lastVaccine: '1402/11/20', nextCheckup: '1403/01/20', image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e27?auto=format&fit=crop&q=80&w=400', roomId: 'r3', admissionDate: '1402/12/10', logs: [] },
  { id: 'd4', ownerId: 'u7', name: 'کوکو', breed: 'شیتزو', age: 4, status: DogStatus.HEALTHY, lastVaccine: '1402/08/10', nextCheckup: '1403/02/10', image: 'https://images.unsplash.com/photo-1494256997604-a2e782af6f0d?auto=format&fit=crop&q=80&w=400', microchip: '982009201', logs: [] },
  { id: 'd5', ownerId: 'u8', name: 'تایسون', breed: 'پیت‌بول', age: 3, status: DogStatus.SICK, lastVaccine: '1402/12/01', nextCheckup: '1402/12/20', image: 'https://images.unsplash.com/photo-1570018144915-49d1d404802b?auto=format&fit=crop&q=80&w=400', roomId: 'r4', logs: [] },
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'آموزش مقدماتی (۱۰ جلسه)', price: 5000000, category: 'Training' },
  { id: 's2', name: 'آموزش پیشرفته (۲۰ جلسه)', price: 9000000, category: 'Training' },
  { id: 's3', name: 'پانسیون شبانه روزی (ساده)', price: 300000, category: 'Boarding' },
  { id: 's4', name: 'پانسیون VIP (با دوربین)', price: 500000, category: 'Boarding' },
  { id: 's5', name: 'چکاپ کامل دامپزشک', price: 800000, category: 'Medical' },
  { id: 's6', name: 'واکسیناسیون', price: 600000, category: 'Medical' },
  { id: 's7', name: 'اصلاح و شستشو', price: 450000, category: 'Grooming' },
  { id: 's8', name: 'غذای خشک رویال (۳ کیلو)', price: 1200000, category: 'Food' },
  { id: 's9', name: 'سرویس ایاب و ذهاب', price: 200000, category: 'Transport' },
  { id: 's10', name: 'اعزام به کلینیک (همراه)', price: 350000, category: 'Medical' },
  { id: 's11', name: 'آموزش به صاحب سگ (ساعتی)', price: 400000, category: 'Training' },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', userId: 'u3', dogId: 'd1', serviceId: 's1', amount: 5000000, discount: 0, finalAmount: 5000000, paidAmount: 5000000, date: '1402/12/01', dueDate: '1402/12/08', status: InvoiceStatus.PAID },
  { id: 'inv2', userId: 'u3', dogId: 'd2', serviceId: 's5', amount: 800000, discount: 0, finalAmount: 800000, paidAmount: 0, date: '1402/12/10', dueDate: '1402/12/17', status: InvoiceStatus.PENDING },
  { id: 'inv3', userId: 'u4', dogId: 'd3', serviceId: 's3', amount: 3000000, discount: 100000, finalAmount: 2900000, paidAmount: 2900000, date: '1402/12/15', dueDate: '1402/12/22', status: InvoiceStatus.PAID },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', category: 'حقوق', amount: 15000000, description: 'حقوق مربیان بهمن ماه', date: '1402/11/30' },
  { id: 'e2', category: 'خوراک', amount: 3500000, description: 'خرید غذای خشک رویال', date: '1402/12/05' },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv_f1', name: 'غذای خشک رویال (بالغ)', category: 'Food', quantity: 50, unit: 'کیلوگرم', minQuantity: 10, averageCost: 350000 },
  { id: 'inv_f2', name: 'کنسرو تشویقی', category: 'Food', quantity: 20, unit: 'قوطی', minQuantity: 5, averageCost: 120000 },
  { id: 'inv_m1', name: 'قرص انگل', category: 'Medical', quantity: 100, unit: 'عدد', minQuantity: 20, averageCost: 15000 },
  { id: 'inv_e1', name: 'مایع ضدعفونی کننده', category: 'Equipment', quantity: 10, unit: 'لیتر', minQuantity: 2, averageCost: 80000 },
];

export const MOCK_CHECKS: Check[] = [
  { id: 'ch1', type: 'Received', amount: 5000000, checkNumber: '123456', bankName: 'ملت', dueDate: '1403/02/01', issuerOrPayee: 'رضا کاظمی', status: 'Pending', registeredDate: '1402/12/01' },
];
