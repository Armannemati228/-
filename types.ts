
export enum UserRole {
  ADMIN = 'مدیر کل',
  INTERNAL_MANAGER = 'مدیر داخلی',
  ACCOUNTANT = 'حسابدار',
  VET = 'دامپزشک',
  RECEPTIONIST = 'کارمند پذیرش',
  TRAINER = 'مربی',
  STAFF = 'پرسنل ساده',
  CLIENT = 'مشتری (صاحب سگ)',
  BREEDER = 'پرورش دهنده',
}

export enum DogStatus {
  HEALTHY = 'سالم',
  SICK = 'تحت درمان',
  IN_TRAINING = 'در حال آموزش',
  BOARDING = 'پانسیون',
  TRAINING_BOARDING = 'آموزش و پانسیون',
  CHECKED_OUT = 'ترخیص شده (راکد)',
}

export enum PaymentMethod {
  CASH = 'نقدی',
  CARD = 'کارتخوان',
  ONLINE = 'آنلاین (درگاه)',
  WALLET = 'کیف پول',
  INSTALLMENT = 'اقساطی',
  CHECK = 'چک',
}

export enum InvoiceStatus {
  PAID = 'پرداخت شده',
  PENDING = 'در انتظار',
  OVERDUE = 'معوق',
  INSTALLMENT = 'قسطی',
}

export enum TransactionType {
  DEPOSIT = 'شارژ کیف پول',
  WITHDRAWAL = 'برداشت وجه',
  PAYMENT = 'پرداخت فاکتور',
  SALARY = 'حقوق',
  BONUS = 'پاداش',
  COMMISSION = 'پورسانت',
  REFUND = 'بازگشت وجه',
  MANUAL_ADJUSTMENT = 'تغییر دستی مدیر',
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  isCredit: boolean;
}

export interface PaymentGatewaySettings {
  isEnabled: boolean;
  merchantId: string;
  apiKey: string;
  callbackUrl: string;
}

export interface SMSConfig {
  isEnabled: boolean;
  provider: 'KavehNegar' | 'FarazSMS' | 'MeliPayamak' | 'Other';
  apiKey: string;
  senderLine: string;
  patternCode: string; // For OTP patterns
}

export interface HostConfig {
  domain: string;
  host: string;
  port: string;
  username: string;
  password: string;
  protocol: 'FTP' | 'SFTP';
}

export interface UserPermissions {
  accessDashboard: boolean;
  manageDogs: boolean;
  manageFinance: boolean;
  manageUsers: boolean;
  manageMedical: boolean;
  manageRooms: boolean;
  viewReports: boolean;
  manageInventory: boolean;
  log_food: boolean;
  log_medical: boolean;
  log_training: boolean;
  log_activity: boolean;
}

export interface User {
  id: string;
  name: string;
  roles: UserRole[];
  phone: string;
  password?: string;
  email?: string;
  avatar?: string;
  balance: number; 
  joinedDate: string;
  permissions: UserPermissions;
  employmentDate?: string;
  baseSalary?: number;
  commissionOverrides?: { [category: string]: number };
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  occupiedBy: string[];
  type: 'Standard' | 'VIP' | 'Isolation';
}

export interface LogEntry {
  time: string;
  description: string;
  amount?: string;
  inventoryItemId?: string;
  quantityUsed?: number;
  weight?: number;
  feedType?: 'Meal' | 'Treat';
}

export interface DailyLog {
  id: string;
  date: string;
  staffName: string;
  foodEntries: LogEntry[]; 
  medicalEntries: LogEntry[];
  activityEntries: LogEntry[];
  foodIntake?: string; 
  medicalNotes?: string;
  activityNotes?: string;
  washed: boolean;
}

export interface TrainingSession {
  id: string;
  date: string;
  duration: number;
  skillsTaught: string;
  performance: 'Excellent' | 'Good' | 'Average' | 'Poor';
  trainerNotes: string;
  trainerId: string;
  trainerName: string;
}

export interface ServiceRequest {
  id: string;
  dogId: string;
  ownerId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  notes?: string;
}

export interface AssignedTrainer {
  trainerId: string;
  trainerName: string;
  specialty: string;
  commission: number;
  assignedDate: string;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  birthDate?: string; 
  image: string;
  status: DogStatus;
  lastVaccine: string;
  nextCheckup: string;
  microchip?: string;
  roomId?: string;
  admissionDate?: string;
  checkoutDate?: string;
  dischargePhoto?: string;
  deliveryRecipient?: string;
  actualCheckoutDate?: string;
  contractNumber?: string;
  contractImage?: string;
  trainers?: AssignedTrainer[];
  trainingPlan?: string;
  logs?: DailyLog[];
  trainingSessions?: TrainingSession[];
  serviceRequests?: ServiceRequest[];
  trainingFinishedDate?: string;
  trainingApprovedDate?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: 'Training' | 'Boarding' | 'Medical' | 'Food' | 'Grooming' | 'Transport' | 'Other';
  targetRoomType?: 'Standard' | 'VIP' | 'Isolation';
  defaultCommission?: number;
}

export interface Invoice {
  id: string;
  userId: string;
  dogId: string;
  serviceId: string;
  serviceName?: string;
  amount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number; 
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  providerId?: string;
  downPayment?: number;
  installments?: {
    dueDate: string;
    amount: number;
    isPaid: boolean;
  }[];
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
  date: string;
  adminResponse?: string;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  isEnabled: boolean;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingDebts: number;
  totalWalletLiability: number; 
  monthlyGrowth: number;
  emergencyFund: number;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface ManagerTask {
  id: string;
  title: string;
  category?: 'Sanitation' | 'Security' | 'Logistics' | 'Staff' | 'Other';
  isEnabled: boolean;
}

export interface ChecklistItem {
  taskId: string;
  title: string;
  isDone: boolean;
  note?: string;
}

export interface DailyChecklist {
  id: string;
  date: string;
  managerId: string;
  managerName: string;
  items: ChecklistItem[];
  verifiedByAdmin: boolean;
  submissionTime: string;
}

export interface EmergencyReport {
  id: string;
  title: string;
  description: string;
  urgency: 'High' | 'Medium' | 'Low';
  reportedBy: string;
  reportedAt: string;
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED';
  assignedToId?: string;
  assignedToName?: string;
  targetRole?: UserRole;
  adminNote?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  dogId?: string;
  dogName?: string;
}

export type InventoryCategory = 'Food' | 'Medical' | 'Equipment' | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minQuantity: number;
  averageCost: number; // New: For accounting (Cost per unit)
  description?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unitPrice?: number; // New: Purchase price
  totalPrice?: number; // New: Total transaction value
  date: string;
  userId: string;
  userName: string;
  relatedDogId?: string;
  description?: string;
}

export interface SystemLog {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  userId?: string;
  userRole?: string;
  timestamp: string;
  category: 'Emergency' | 'Operation' | 'Finance' | 'User' | 'System' | 'Medical';
}

export interface PrescriptionItem {
  id: string;
  inventoryItemId?: string;
  name: string;
  dosageQuantity: number;
  unit: string;
  route: string;
  frequencyDescription: string;
  frequencyPerDay: number;
  totalDoses?: number;
  administeredCount?: number;
  needsPurchase: boolean;
}

export interface TreatmentPlan {
  id: string;
  dogId: string;
  vetId: string;
  diagnosis: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  medications: PrescriptionItem[];
  status: 'ACTIVE' | 'COMPLETED' | 'WAITING_FOR_RESULT'; 
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  treatmentOutcome?: 'CURED' | 'NOT_CURED' | 'PARTIAL'; 
  outcomeNotes?: string;
  notes?: string;
}

export interface PurchaseRequest {
  id: string;
  itemName: string;
  quantity: number;
  status: 'PENDING' | 'PURCHASED';
  requestedBy: string;
  requestDate: string;
  reason: string;
}

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  isActive: boolean;
  description?: string;
}

export interface JournalEntryLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  documentNumber: number;
  description: string;
  reference?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  lines: JournalEntryLine[];
  status: 'DRAFT' | 'POSTED';
  createdBy: string;
  createdAt: string;
}

export interface Check {
  id: string;
  type: 'Received' | 'Paid';
  amount: number;
  checkNumber: string;
  bankName: string;
  dueDate: string;
  issuerOrPayee: string;
  status: 'Pending' | 'Cleared' | 'Bounced';
  registeredDate: string;
}

export interface Payslip {
  id: string;
  userId: string;
  userName: string;
  period: string;
  baseSalary: number;
  commission: number;
  bonuses: number;
  deductions: number;
  netPayable: number;
  paymentDate: string;
}

// Backup Type Definition
export interface SystemBackup {
  metadata: {
    timestamp: string;
    version: string;
    exportedBy: string;
  };
  data: {
    users: User[];
    dogs: Dog[];
    services: Service[];
    invoices: Invoice[];
    expenses: Expense[];
    transactions: WalletTransaction[];
    rooms: Room[];
    tickets: Ticket[];
    reminders: Reminder[];
    managerTasks: ManagerTask[];
    dailyChecklists: DailyChecklist[];
    emergencyReports: EmergencyReport[];
    systemLogs: SystemLog[];
    inventory: InventoryItem[];
    inventoryTransactions: InventoryTransaction[];
    activeTreatments: TreatmentPlan[];
    purchaseRequests: PurchaseRequest[];
    accounts: Account[];
    journalEntries: JournalEntry[];
    checks: Check[];
    payslips: Payslip[];
    settings: {
      gateway: PaymentGatewaySettings;
      sms: SMSConfig;
      host: HostConfig;
      ai: AIConfig;
      productionTolerance: number;
    }
  }
}
