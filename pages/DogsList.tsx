
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Dog, DogStatus, DailyLog, InvoiceStatus, UserRole, LogEntry, PaymentMethod } from '../types';
import { Plus, X, Camera, Upload, LogIn, Activity, Home, LogOut, FileText, ClipboardList, Bell, CheckCircle, Utensils, Stethoscope, Trash2, Package, TrendingUp, Save, Printer, AlertTriangle, Image as ImageIcon, Bone, Truck, DollarSign, FileInput, FileDigit, Edit2, RefreshCw, QrCode, CreditCard, FileBadge } from 'lucide-react';
import { APP_LOGO } from '../constants';

export const DogsList: React.FC = () => {
  const { dogs, users, rooms, services, invoices, currentUser, addDog, updateDog, admitDog, changeDogRoom, addDailyLog, dischargeDog, canEdit, getDogFinancialStatus, inventory, activeTreatments } = useApp();
  const [filter, setFilter] = useState<string>('active'); 

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdmissionModal, setShowAdmissionModal] = useState<Dog | null>(null);
  const [showLogModal, setShowLogModal] = useState<Dog | null>(null);
  const [showRoomModal, setShowRoomModal] = useState<Dog | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<Dog | null>(null);
  const [showReportModal, setShowReportModal] = useState<Dog | null>(null);
  const [showRequestsModal, setShowRequestsModal] = useState<Dog | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Dog | null>(null);
  const [showIDCardModal, setShowIDCardModal] = useState<Dog | null>(null);

  // Admission Form State
  const [admissionForm, setAdmissionForm] = useState<{
      status: DogStatus;
      roomId: string;
      duration: number;
      selectedServices: string[]; 
      contractNumber: string;
      contractImage: string;
      downPayment: string;
      discount: string;
      paymentMethod: PaymentMethod;
  }>({
      status: DogStatus.BOARDING,
      roomId: '',
      duration: 1,
      selectedServices: [],
      contractNumber: '',
      contractImage: '',
      downPayment: '',
      discount: '',
      paymentMethod: PaymentMethod.CASH
  });

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
      recipientName: '',
      actualDate: new Date().toLocaleDateString('fa-IR')
  });

  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [contractPreview, setContractPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

  // Add Dog Form
  const [addForm, setAddForm] = useState({
    name: '', breed: '', age: '', birthDate: '', ownerId: '', status: DogStatus.HEALTHY, microchip: '', lastVaccine: '', nextCheckup: ''
  });

  // Edit Dog Form
  const [editForm, setEditForm] = useState<{ name: string, breed: string, age: string, birthDate: string, microchip: string, ownerId: string }>({
      name: '', breed: '', age: '', birthDate: '', microchip: '', ownerId: ''
  });

  // Dynamic Log Form State
  const [logForm, setLogForm] = useState<{
      foodEntries: LogEntry[];
      medicalEntries: LogEntry[];
      activityEntries: LogEntry[];
      washed: boolean;
  }>({
      foodEntries: [],
      medicalEntries: [],
      activityEntries: [],
      washed: false
  });

  const [idCardTab, setIdCardTab] = useState<'card' | 'certificate'>('card');

  useEffect(() => {
      if(showLogModal) setLogForm({ foodEntries: [], medicalEntries: [], activityEntries: [], washed: false });
  }, [showLogModal]);

  useEffect(() => {
      if(showCheckoutModal) {
          const owner = users.find(u => u.id === showCheckoutModal.ownerId);
          setCheckoutForm({ recipientName: owner?.name || '', actualDate: new Date().toLocaleDateString('fa-IR') });
          setImagePreview('');
      }
  }, [showCheckoutModal, users]);

  // Auto-fill Edit Form
  useEffect(() => {
      if (showEditModal) {
          setEditForm({
              name: showEditModal.name,
              breed: showEditModal.breed,
              age: showEditModal.age.toString(),
              birthDate: showEditModal.birthDate || '',
              microchip: showEditModal.microchip || '',
              ownerId: showEditModal.ownerId
          });
          setEditImagePreview(showEditModal.image);
      }
  }, [showEditModal]);

  // Auto-assign Room
  useEffect(() => {
      if (showAdmissionModal && !admissionForm.roomId) {
          const availableStandard = rooms.find(r => r.type === 'Standard' && r.capacity > r.occupiedBy.length);
          if (availableStandard) {
              setAdmissionForm(prev => ({ ...prev, roomId: availableStandard.id }));
          }
      }
  }, [showAdmissionModal, rooms]);

  const calculateAge = (birthDateStr: string) => {
      if (!birthDateStr) return '';
      try {
          const currentYear = 1403; // Approximate current Jalali year
          const birthYear = parseInt(birthDateStr.split('/')[0]);
          if (!isNaN(birthYear)) {
              const diff = currentYear - birthYear;
              if (diff < 1) return 'زیر یک سال';
              return `${diff}`;
          }
      } catch (e) { return ''; }
      return '';
  };

  const totalAdmissionCost = Math.max(0, admissionForm.selectedServices.reduce((acc, svcId) => {
      const s = services.find(ser => ser.id === svcId);
      return acc + (s?.price || 0);
  }, 0) - (Number(admissionForm.discount) || 0));

  const displayedDogs = dogs.filter(d => filter === 'active' ? d.status !== DogStatus.CHECKED_OUT : d.status === DogStatus.CHECKED_OUT);

  const getStatusColor = (status: DogStatus) => {
    switch (status) {
      case DogStatus.HEALTHY: return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case DogStatus.SICK: return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case DogStatus.IN_TRAINING: return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case DogStatus.BOARDING: return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case DogStatus.TRAINING_BOARDING: return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
      case DogStatus.CHECKED_OUT: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.ownerId) return;
    
    let calcAge = Number(addForm.age);
    if (addForm.birthDate && !addForm.age) {
        calcAge = Number(calculateAge(addForm.birthDate)) || 1;
    }

    const newDog: Dog = {
      id: Math.random().toString(36).substr(2, 9),
      name: addForm.name, breed: addForm.breed, age: calcAge, birthDate: addForm.birthDate, ownerId: addForm.ownerId, status: addForm.status as DogStatus, microchip: addForm.microchip, lastVaccine: addForm.lastVaccine || '1402/01/01', nextCheckup: addForm.nextCheckup || '1402/04/01', image: imagePreview || `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`, logs: []
    };
    addDog(newDog); setShowAddModal(false); setAddForm({ name: '', breed: '', age: '', birthDate: '', ownerId: '', status: DogStatus.HEALTHY, microchip: '', lastVaccine: '', nextCheckup: '' }); setImagePreview('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!showEditModal || !editForm.name || !editForm.ownerId) return;
      
      let calcAge = Number(editForm.age);
      if (editForm.birthDate && (!editForm.age || editForm.age === '0')) {
          calcAge = Number(calculateAge(editForm.birthDate)) || 1;
      }

      const updatedDog: Dog = {
          ...showEditModal,
          name: editForm.name,
          breed: editForm.breed,
          age: calcAge,
          birthDate: editForm.birthDate,
          microchip: editForm.microchip,
          ownerId: editForm.ownerId,
          image: editImagePreview || showEditModal.image
      };
      
      updateDog(updatedDog);
      setShowEditModal(null);
      alert('اطلاعات سگ با موفقیت بروزرسانی شد.');
  };

  const handleAdmissionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!showAdmissionModal || !admissionForm.roomId || admissionForm.selectedServices.length === 0) {
          alert('لطفا اتاق و حداقل یک خدمت را انتخاب کنید.');
          return;
      }
      admitDog(
          showAdmissionModal.id, 
          admissionForm.status, 
          admissionForm.roomId, 
          new Date().toLocaleDateString('fa-IR'), 
          '1403/XX/XX',
          admissionForm.selectedServices,
          admissionForm.contractNumber,
          contractPreview, 
          Number(admissionForm.downPayment),
          Number(admissionForm.discount),
          admissionForm.paymentMethod
      );
      setShowAdmissionModal(null); setContractPreview('');
      setAdmissionForm({ status: DogStatus.BOARDING, roomId: '', duration: 1, selectedServices: [], contractNumber: '', contractImage: '', downPayment: '', discount: '', paymentMethod: PaymentMethod.CASH });
      alert('پذیرش با موفقیت انجام شد، فاکتور صادر و تراکنش مالی ثبت گردید.');
  };

  const handleServiceToggle = (serviceId: string) => {
      setAdmissionForm(prev => {
          const newServices = prev.selectedServices.includes(serviceId) 
              ? prev.selectedServices.filter(id => id !== serviceId)
              : [...prev.selectedServices, serviceId];
          return { ...prev, selectedServices: newServices };
      });
  };

  const handleLogSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!showLogModal) return; const newLog: DailyLog = { id: `log_${Date.now()}`, date: new Date().toLocaleDateString('fa-IR'), staffName: currentUser?.name || 'پرسنل', foodEntries: logForm.foodEntries, medicalEntries: logForm.medicalEntries, activityEntries: logForm.activityEntries, washed: logForm.washed }; addDailyLog(showLogModal.id, newLog); setShowLogModal(null); };
  
  const handleCheckoutSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!showCheckoutModal || !imagePreview || !checkoutForm.recipientName) { alert('لطفا عکس تحویل و نام تحویل گیرنده را وارد کنید'); return; } dischargeDog(showCheckoutModal.id, imagePreview, checkoutForm.recipientName, checkoutForm.actualDate); setShowCheckoutModal(null); setImagePreview(''); setShowSuccessMessage(true); };

  const addEntry = (type: 'food' | 'medical' | 'activity') => { const newEntry: LogEntry = { time: new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}), description: '' }; if (type === 'food') setLogForm(prev => ({ ...prev, foodEntries: [...prev.foodEntries, { ...newEntry, feedType: 'Meal' }] })); if (type === 'medical') setLogForm(prev => ({ ...prev, medicalEntries: [...prev.medicalEntries, newEntry] })); if (type === 'activity') setLogForm(prev => ({ ...prev, activityEntries: [...prev.activityEntries, newEntry] })); };
  const removeEntry = (type: 'food' | 'medical' | 'activity', index: number) => { if (type === 'food') setLogForm(prev => ({ ...prev, foodEntries: prev.foodEntries.filter((_, i) => i !== index) })); if (type === 'medical') setLogForm(prev => ({ ...prev, medicalEntries: prev.medicalEntries.filter((_, i) => i !== index) })); if (type === 'activity') setLogForm(prev => ({ ...prev, activityEntries: prev.activityEntries.filter((_, i) => i !== index) })); };
  const updateEntry = (type: 'food' | 'medical' | 'activity', index: number, field: keyof LogEntry, value: any) => { const updater = (prev: LogEntry[]) => prev.map((entry, i) => i === index ? { ...entry, [field]: value } : entry); if (type === 'food') setLogForm(prev => ({ ...prev, foodEntries: updater(prev.foodEntries) })); if (type === 'medical') setLogForm(prev => ({ ...prev, medicalEntries: updater(prev.medicalEntries) })); if (type === 'activity') setLogForm(prev => ({ ...prev, activityEntries: updater(prev.activityEntries) })); };
  const handleInventorySelect = (type: 'food' | 'medical', index: number, itemId: string) => { const item = inventory.find(i => i.id === itemId); if (item) { updateEntry(type, index, 'description', item.name); updateEntry(type, index, 'inventoryItemId', itemId); updateEntry(type, index, 'quantityUsed', 1); } };

  const handleRoomChange = (roomId: string) => {
      if (showRoomModal) {
          changeDogRoom(showRoomModal.id, roomId);
          setShowRoomModal(null);
          alert('اتاق با موفقیت تغییر کرد.');
      }
  };

  const getDogReport = (dog: Dog) => { 
      const dogInvoices = invoices.filter(inv => inv.dogId === dog.id); 
      const totalInvoiced = dogInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0); 
      const totalPaid = dogInvoices.reduce((sum, inv) => sum + (inv.paidAmount || (inv.status === InvoiceStatus.PAID ? inv.finalAmount : 0)), 0); 
      const totalPending = totalInvoiced - totalPaid; 
      // ... (rest of report logic remains same)
      let totalFoodWeight = 0; 
      interface UnifiedLogItem { id: string; date: string; time: string; category: string; description: string; staff: string; rawDate: number; }
      const unifiedLogs: UnifiedLogItem[] = []; 
      dog.logs?.forEach(log => { 
          log.foodEntries?.forEach((f, i) => { if (f.weight) totalFoodWeight += f.weight; unifiedLogs.push({ id: `log_f_${log.id}_${i}`, date: log.date, time: f.time, category: 'Food', description: `${f.description} ${f.weight ? `(${f.weight}g)` : ''}`, staff: log.staffName, rawDate: new Date(log.date).getTime() }); }); 
          log.medicalEntries?.forEach((m, i) => { unifiedLogs.push({ id: `log_m_${log.id}_${i}`, date: log.date, time: m.time, category: 'Medical', description: m.description, staff: log.staffName, rawDate: new Date(log.date).getTime() }); }); 
          log.activityEntries?.forEach((a, i) => { unifiedLogs.push({ id: `log_a_${log.id}_${i}`, date: log.date, time: a.time, category: 'Activity', description: a.description, staff: log.staffName, rawDate: new Date(log.date).getTime() }); }); 
          if (log.washed) { unifiedLogs.push({ id: `log_w_${log.id}`, date: log.date, time: '---', category: 'Cleaning', description: 'شستشو انجام شد', staff: log.staffName, rawDate: new Date(log.date).getTime() }); } 
      }); 
      dog.trainingSessions?.forEach(session => { unifiedLogs.push({ id: session.id, date: session.date, time: '---', category: 'Training', description: session.skillsTaught, staff: session.trainerName, rawDate: new Date(session.date).getTime() }); }); 
      activeTreatments.filter(t => t.dogId === dog.id).forEach(plan => { unifiedLogs.push({ id: plan.id, date: plan.startDate, time: '---', category: 'Medical', description: `طرح درمان: ${plan.diagnosis}`, staff: 'دامپزشک', rawDate: new Date(plan.startDate).getTime() }); }); 
      dog.serviceRequests?.forEach(req => { unifiedLogs.push({ id: req.id, date: req.requestDate, time: '---', category: 'Service', description: req.serviceName, staff: 'System', rawDate: new Date(req.requestDate).getTime() }); }); 
      unifiedLogs.sort((a, b) => b.rawDate - a.rawDate); 
      return { totalInvoiced, totalPaid, totalPending, unifiedLogs, washCount: unifiedLogs.filter(l => l.category === 'Cleaning').length, totalFoodWeight }; 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت و پذیرش سگ‌ها</h2>{canEdit && (<button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/30"><Plus size={20} /> ثبت سگ جدید</button>)}</div>
      {/* ... rest of the existing list rendering code ... */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex gap-4 items-center border border-gray-100 dark:border-gray-700"><button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'text-gray-500'}`}>سگ‌های حاضر (فعال)</button><button onClick={() => setFilter('archived')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'archived' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'text-gray-500'}`}>بایگانی (ترخیص شده)</button></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedDogs.map(dog => { 
              const owner = users.find(u => u.id === dog.ownerId); 
              const room = rooms.find(r => r.id === dog.roomId); 
              return (
                  <div key={dog.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 flex flex-col relative group">
                      {isAdmin && (<button onClick={() => setShowEditModal(dog)} className="absolute top-2 left-2 z-20 bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-white shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all" title="ویرایش اطلاعات سگ"><Edit2 size={16}/></button>)}
                      <div className="h-48 overflow-hidden relative"><img src={dog.image} alt={dog.name} className="w-full h-full object-cover" /><div className="absolute top-3 right-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(dog.status)}`}>{dog.status}</span></div>{room && (<div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1 backdrop-blur-sm"><Home size={12}/>{room.name}</div>)}</div>
                      <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2"><div><h3 className="text-lg font-bold text-gray-800 dark:text-white">{dog.name}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{dog.breed} • {dog.age ? `${dog.age} ساله` : 'سن نامشخص'}</p></div></div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg flex items-center gap-2 mb-4"><img src={owner?.avatar} className="w-6 h-6 rounded-full" alt="" /><span className="text-xs font-medium text-gray-700 dark:text-gray-200">{owner?.name}</span></div>
                          <div className="mt-auto grid grid-cols-2 gap-2">
                              {canEdit && (<><button onClick={() => setShowReportModal(dog)} className="bg-gray-800 text-white dark:bg-white dark:text-gray-800 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-colors flex justify-center items-center gap-1"><ClipboardList size={14} /> گزارش</button><button onClick={() => setShowIDCardModal(dog)} className="bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex justify-center items-center gap-1"><QrCode size={14} /> شناسنامه</button></>)}
                              {filter === 'active' && canEdit ? (<>{dog.status === DogStatus.HEALTHY || dog.status === DogStatus.CHECKED_OUT ? (<button onClick={() => setShowAdmissionModal(dog)} className="col-span-2 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-1"><LogIn size={14}/> پذیرش (ورود)</button>) : (<><button onClick={() => setShowLogModal(dog)} className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 py-2 rounded-lg text-xs hover:bg-amber-200 transition-colors flex justify-center items-center gap-1"><FileText size={14}/> ثبت روزانه</button><button onClick={() => setShowRoomModal(dog)} className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-2 rounded-lg text-xs hover:bg-gray-200 transition-colors flex justify-center items-center gap-1"><Home size={14}/> تغییر اتاق</button><button onClick={() => setShowCheckoutModal(dog)} className="col-span-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-2 rounded-lg text-xs hover:bg-red-100 transition-colors flex justify-center items-center gap-1 border border-red-100 dark:border-red-900"><LogOut size={14}/> ترخیص و تسویه</button></>)}</>) : (<div className="col-span-2 text-center text-xs text-gray-400">{dog.status === DogStatus.CHECKED_OUT ? 'این سگ ترخیص شده است' : 'مشاهده جزئیات'}</div>)}
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>

      {/* Admission Modal */}
      {showAdmissionModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full animate-fade-in max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl dark:text-white flex items-center gap-2"><LogIn size={24} className="text-blue-600"/> پذیرش و عقد قرارداد</h3><button onClick={() => setShowAdmissionModal(null)}><X className="text-gray-500"/></button></div>
                  <form onSubmit={handleAdmissionSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border dark:border-gray-600"><h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">۱. اطلاعات اقامت</h4><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-400">نوع اتاق</label><select className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={rooms.find(r=>r.id===admissionForm.roomId)?.type || 'Standard'} onChange={e => { const firstAvailable = rooms.find(r => r.type === e.target.value && r.capacity > r.occupiedBy.length); if(firstAvailable) setAdmissionForm({...admissionForm, roomId: firstAvailable.id}); }}><option value="Standard">استاندارد</option><option value="VIP">VIP</option><option value="Isolation">قرنطینه</option></select></div><div><label className="block text-xs mb-1 dark:text-gray-400">شماره اتاق</label><select className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={admissionForm.roomId} onChange={e => setAdmissionForm({...admissionForm, roomId: e.target.value})} required><option value="">انتخاب اتاق...</option>{rooms.filter(r => r.capacity > r.occupiedBy.length).map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}</select></div></div></div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border dark:border-gray-600"><h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">۲. انتخاب خدمات</h4><div className="space-y-2 max-h-40 overflow-y-auto pr-2">{services.map(svc => (<label key={svc.id} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-600 rounded cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-500 transition-colors"><div className="flex items-center gap-2"><input type="checkbox" checked={admissionForm.selectedServices.includes(svc.id)} onChange={() => handleServiceToggle(svc.id)} className="w-4 h-4 text-blue-600 rounded"/><span className="text-sm dark:text-gray-300">{svc.name}</span></div><span className="text-xs font-bold text-gray-600 dark:text-gray-400">{new Intl.NumberFormat('fa-IR').format(svc.price)}</span></label>))}</div><div className="mt-4 pt-4 border-t dark:border-gray-600 flex justify-between items-center"><span className="font-bold dark:text-white">جمع کل خدمات:</span><span className="text-lg font-black text-blue-600">{new Intl.NumberFormat('fa-IR').format(totalAdmissionCost)} تومان</span></div></div>
                      </div>
                      <div className="space-y-6">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border dark:border-gray-600"><h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">۳. قرارداد فیزیکی</h4><div className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-400">شماره پرونده/قرارداد</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={admissionForm.contractNumber} onChange={e => setAdmissionForm({...admissionForm, contractNumber: e.target.value})} placeholder="مثلا: 1402-A-123" /></div><div className="border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setContractPreview)} />{contractPreview ? <div className="flex flex-col items-center"><img src={contractPreview} className="h-24 object-contain mb-2" /><span className="text-xs text-green-600">تصویر بارگذاری شد</span></div> : <div className="flex flex-col items-center text-gray-400"><FileDigit size={32} className="mb-2"/><span className="text-xs">آپلود اسکن قرارداد</span></div>}</div></div></div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border dark:border-gray-600"><h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">۴. شرایط پرداخت</h4>
                              <div className="space-y-3">
                                  <div><label className="block text-xs mb-1 dark:text-gray-400">مبلغ پیش‌پرداخت</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={admissionForm.downPayment} onChange={e => setAdmissionForm({...admissionForm, downPayment: e.target.value})} placeholder="0" /></div>
                                  {isAdmin && (
                                      <div><label className="block text-xs mb-1 dark:text-gray-400">تخفیف (مدیر کل)</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={admissionForm.discount} onChange={e => setAdmissionForm({...admissionForm, discount: e.target.value})} placeholder="0" /></div>
                                  )}
                                  <div><label className="block text-xs mb-1 dark:text-gray-400">روش پرداخت</label><select className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={admissionForm.paymentMethod} onChange={e => setAdmissionForm({...admissionForm, paymentMethod: e.target.value as PaymentMethod})}><option value={PaymentMethod.CASH}>نقدی</option><option value={PaymentMethod.CARD}>کارتخوان</option><option value={PaymentMethod.WALLET}>کیف پول</option><option value={PaymentMethod.CHECK}>چک</option></select></div>
                              </div>
                          </div>
                          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-transform hover:scale-105">تایید نهایی پذیرش</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      
      {/* ... other modals (Checkout, Log, Report, Add, Edit, ID) remain same, just ensuring imports/context */}
      {showAddModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full animate-fade-in max-h-[90vh] overflow-y-auto"><h3 className="font-bold text-lg mb-4 dark:text-white">ثبت سگ جدید</h3><form onSubmit={handleAddSubmit} className="space-y-4"><div className="flex justify-center mb-4"><div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border-2 border-dashed border-gray-300 dark:border-gray-600"><input type="file" ref={fileInputRef} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageUpload(e, setImagePreview)} />{imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="text-gray-400" size={32} />}</div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">نام سگ</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">نژاد</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={addForm.breed} onChange={e => setAddForm({...addForm, breed: e.target.value})} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">تاریخ تولد</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={addForm.birthDate} onChange={e => setAddForm({...addForm, birthDate: e.target.value})} placeholder="YYYY/MM/DD" /></div><div><label className="block text-xs mb-1 dark:text-gray-300">صاحب سگ</label><select required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={addForm.ownerId} onChange={e => setAddForm({...addForm, ownerId: e.target.value})}><option value="">انتخاب کنید...</option>{users.filter(u => u.roles.includes(UserRole.CLIENT)).map(u => <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>)}</select></div></div><div><label className="block text-xs mb-1 dark:text-gray-300">شماره میکروچیپ</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-left" value={addForm.microchip} onChange={e => setAddForm({...addForm, microchip: e.target.value})} /></div><div className="flex gap-2 mt-4"><button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-gray-500">انصراف</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">ثبت</button></div></form></div></div>)}
      {showCheckoutModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full animate-fade-in"><h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2"><LogOut className="text-red-600"/> ترخیص و تسویه حساب</h3>{(() => { const { totalDebt, isCleared } = getDogFinancialStatus(showCheckoutModal.id); if (!isCleared) { return (<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 mb-4 text-center"><AlertTriangle size={32} className="mx-auto text-red-600 mb-2"/><h4 className="font-bold text-red-800 dark:text-red-200">امکان ترخیص وجود ندارد!</h4><p className="text-sm text-red-700 dark:text-red-300 mt-1">این سگ دارای بدهی تسویه نشده است.</p><p className="text-xl font-black text-red-600 mt-2">{new Intl.NumberFormat('fa-IR').format(totalDebt)} تومان</p><button onClick={() => setShowCheckoutModal(null)} className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg text-sm font-bold">بستن و مراجعه به امور مالی</button></div>); } return (<form onSubmit={handleCheckoutSubmit} className="space-y-4"><div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300 mb-4 border border-green-200 dark:border-green-800"><CheckCircle size={20}/><span className="text-sm font-bold">حساب مالی تسویه است.</span></div><div><label className="block text-xs mb-1 dark:text-gray-400">نام تحویل گیرنده</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={checkoutForm.recipientName} onChange={e => setCheckoutForm({...checkoutForm, recipientName: e.target.value})} placeholder="مثلا: آقای رضایی (صاحب)" /></div><div><label className="block text-xs mb-1 dark:text-gray-400">تاریخ تحویل</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center" value={checkoutForm.actualDate} readOnly /></div><div><label className="block text-xs mb-2 dark:text-gray-400">عکس یادگاری / تحویل</label><div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-32 flex items-center justify-center cursor-pointer relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setImagePreview)} />{imagePreview ? <img src={imagePreview} className="h-full object-contain" /> : <div className="text-center text-gray-400"><Camera size={24} className="mx-auto mb-1"/><span className="text-xs">بارگذاری تصویر</span></div>}</div></div><button type="submit" className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg">تایید نهایی ترخیص</button></form>); })()}</div></div>)}
      {showLogModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full animate-fade-in max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white">ثبت گزارش روزانه</h3><button onClick={() => setShowLogModal(null)}><X className="text-gray-500"/></button></div><form onSubmit={handleLogSubmit} className="space-y-6"><div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4"><div className="flex justify-between mb-2"><h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2"><Utensils size={16}/> تغذیه</h4><button type="button" onClick={() => addEntry('food')} className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded"><Plus size={12}/></button></div><div className="space-y-2">{logForm.foodEntries.map((entry, idx) => (<div key={idx} className="flex flex-col gap-2 p-2 bg-white dark:bg-gray-700/50 rounded-lg"><div className="flex gap-2"><input type="time" className="w-16 p-1 text-xs rounded border dark:bg-gray-600 dark:text-white" value={entry.time} onChange={e=>updateEntry('food', idx, 'time', e.target.value)} /><select className="text-xs p-1 rounded border dark:bg-gray-600 dark:text-white" value={entry.feedType} onChange={e=>updateEntry('food', idx, 'feedType', e.target.value)}><option value="Meal">وعده</option><option value="Treat">تشویقی</option></select><select className="flex-1 text-xs p-1 rounded border dark:bg-gray-600 dark:text-white" onChange={e=>handleInventorySelect('food', idx, e.target.value)}><option value="">انتخاب غذا...</option>{inventory.filter(i=>i.category==='Food').map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select><button type="button" onClick={()=>removeEntry('food', idx)} className="text-red-500"><Trash2 size={14}/></button></div><div className="flex gap-2 items-center"><span className="text-xs text-gray-500">وزن(g):</span><input type="number" className="w-16 p-1 text-xs rounded border dark:bg-gray-600 dark:text-white" value={entry.weight || ''} onChange={e=>updateEntry('food', idx, 'weight', Number(e.target.value))} /></div></div>))}</div></div><div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl p-4"><div className="flex justify-between mb-2"><h4 className="font-bold text-red-800 dark:text-red-200 text-sm flex items-center gap-2"><Stethoscope size={16}/> پزشکی</h4><button type="button" onClick={() => addEntry('medical')} className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded"><Plus size={12}/></button></div><div className="space-y-2">{logForm.medicalEntries.map((entry, idx) => (<div key={idx} className="flex gap-2 p-2 bg-white dark:bg-gray-700/50 rounded-lg"><input type="time" className="w-16 p-1 text-xs rounded border dark:bg-gray-600 dark:text-white" value={entry.time} onChange={e=>updateEntry('medical', idx, 'time', e.target.value)} /><input type="text" placeholder="توضیحات" className="flex-1 p-1 text-xs rounded border dark:bg-gray-600 dark:text-white" value={entry.description} onChange={e=>updateEntry('medical', idx, 'description', e.target.value)} /><button type="button" onClick={()=>removeEntry('medical', idx)} className="text-red-500"><Trash2 size={14}/></button></div>))}</div></div><button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">ثبت گزارش</button></form></div></div>)}
      {showReportModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-3xl w-full animate-fade-in max-h-[90vh] overflow-y-auto print:fixed print:inset-0 print:w-full print:h-full print:bg-white print:z-[100]"><div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6"><div className="flex items-center gap-4"><img src={APP_LOGO} className="w-20 h-20 object-contain grayscale" /><div className="text-right"><h1 className="text-2xl font-black text-gray-900">باشگاه سگ‌های مستر روتوایلر</h1><p className="text-sm text-gray-600">گزارش جامع پرونده سگ</p></div></div><div className="text-left"><p className="text-sm font-bold text-gray-800">تاریخ گزارش: {new Date().toLocaleDateString('fa-IR')}</p><p className="text-xs text-gray-500 mt-1">شماره پرونده: {showReportModal.contractNumber || '---'}</p></div></div><div className="grid grid-cols-2 gap-6 mb-6"><div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><h4 className="font-bold text-gray-700 mb-2 border-b pb-1">مشخصات سگ</h4><p className="text-sm"><span className="text-gray-500">نام:</span> <b>{showReportModal.name}</b></p><p className="text-sm"><span className="text-gray-500">نژاد:</span> {showReportModal.breed}</p><p className="text-sm"><span className="text-gray-500">سن:</span> {showReportModal.age} سال</p><p className="text-sm"><span className="text-gray-500">میکروچیپ:</span> {showReportModal.microchip}</p></div>{(() => { const rep = getDogReport(showReportModal); return (<div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><h4 className="font-bold text-gray-700 mb-2 border-b pb-1">وضعیت مالی</h4><div className="flex justify-between text-sm mb-1"><span>کل هزینه ها:</span><b>{new Intl.NumberFormat('fa-IR').format(rep.totalInvoiced)}</b></div><div className="flex justify-between text-sm mb-1"><span>پرداختی:</span><b className="text-green-600">{new Intl.NumberFormat('fa-IR').format(rep.totalPaid)}</b></div><div className="flex justify-between text-sm border-t pt-1"><span>بدهی:</span><b className="text-red-600">{new Intl.NumberFormat('fa-IR').format(rep.totalPending)}</b></div></div>);})()}</div><h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Activity size={18}/> ریز گزارشات و فعالیت‌ها</h4><div className="border rounded-xl overflow-hidden mb-6"><table className="w-full text-right text-xs"><thead className="bg-gray-100 text-gray-700 border-b"><tr><th className="p-2">تاریخ</th><th className="p-2">زمان</th><th className="p-2">دسته</th><th className="p-2">شرح عملیات</th><th className="p-2">کاربر</th></tr></thead><tbody className="divide-y">{getDogReport(showReportModal).unifiedLogs.map(log => (<tr key={log.id} className="hover:bg-gray-50"><td className="p-2 font-mono">{log.date}</td><td className="p-2 font-mono text-gray-500">{log.time}</td><td className="p-2"><span className={`px-1.5 py-0.5 rounded text-[10px] border ${log.category==='Medical'?'bg-red-50 border-red-200 text-red-700':log.category==='Food'?'bg-amber-50 border-amber-200 text-amber-700':'bg-gray-50 border-gray-200'}`}>{log.category}</span></td><td className="p-2">{log.description}</td><td className="p-2 text-gray-500">{log.staff}</td></tr>))}</tbody></table></div><div className="flex justify-end gap-2 print:hidden"><button onClick={() => setShowReportModal(null)} className="px-4 py-2 text-gray-600 border rounded-lg">بستن</button><button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-bold"><Printer size={18}/> چاپ گزارش</button></div></div></div>)}
      {showRoomModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in"><h3 className="font-bold mb-4 dark:text-white">انتخاب اتاق جدید</h3><div className="space-y-2 max-h-60 overflow-y-auto">{rooms.map(r => { const isFull = r.capacity <= r.occupiedBy.length; return (<button key={r.id} disabled={isFull} onClick={() => handleRoomChange(r.id)} className={`w-full p-3 rounded-lg border flex justify-between items-center ${isFull ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500'}`}><span className="text-sm font-bold dark:text-white">{r.name} <span className="text-xs font-normal text-gray-500">({r.type})</span></span>{isFull ? <span className="text-xs text-red-500">تکمیل</span> : <span className="text-xs text-green-500">آزاد</span>}</button>); })}</div><button onClick={() => setShowRoomModal(null)} className="mt-4 w-full py-2 text-gray-500 border rounded-lg">انصراف</button></div></div>)}
      {showSuccessMessage && (<div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md"><div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full animate-bounce-in text-center"><div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-green-600"/></div><h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">عملیات موفق!</h3><p className="text-gray-500 mb-6">ترخیص سگ با موفقیت انجام شد و سوابق بایگانی گردید.</p><button onClick={() => setShowSuccessMessage(false)} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">متوجه شدم</button></div></div>)}
      {showEditModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full animate-fade-in max-h-[90vh] overflow-y-auto shadow-xl"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Edit2 size={20} className="text-blue-600"/> ویرایش اطلاعات سگ</h3><button onClick={() => setShowEditModal(null)}><X className="text-gray-500"/></button></div><form onSubmit={handleEditSubmit} className="space-y-4"><div className="flex justify-center mb-4"><div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border-2 border-dashed border-gray-300 dark:border-gray-600"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageUpload(e, setEditImagePreview)} />{editImagePreview ? <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="text-gray-400" size={32} />}</div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">نام سگ</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">نژاد</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.breed} onChange={e => setEditForm({...editForm, breed: e.target.value})} /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs mb-1 dark:text-gray-300">تاریخ تولد</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.birthDate} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">میکروچیپ</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono" value={editForm.microchip} onChange={e => setEditForm({...editForm, microchip: e.target.value})} /></div></div><div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-800"><h4 className="text-xs font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-1"><RefreshCw size={12}/> انتقال مالکیت</h4><label className="block text-xs mb-1 dark:text-gray-300">صاحب فعلی / جدید</label><select required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editForm.ownerId} onChange={e => setEditForm({...editForm, ownerId: e.target.value})}>{users.filter(u => u.roles.includes(UserRole.CLIENT)).map(u => <option key={u.id} value={u.id}>{u.name} ({u.phone})</option>)}</select></div><button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 mt-2">ذخیره تغییرات</button></form></div></div>)}
      {showIDCardModal && (<div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-3xl w-full animate-fade-in overflow-hidden flex flex-col max-h-[95vh]"><div className="flex justify-between items-center mb-4 print:hidden"><div className="flex gap-2"><button onClick={() => setIdCardTab('card')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${idCardTab === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>کارت شناسایی</button><button onClick={() => setIdCardTab('certificate')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${idCardTab === 'certificate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>شناسنامه رسمی</button></div><button onClick={() => setShowIDCardModal(null)}><X className="text-gray-500"/></button></div><div className="flex-1 overflow-y-auto p-4 flex justify-center bg-gray-100 dark:bg-gray-900 rounded-xl border dark:border-gray-700 print:bg-white print:border-none print:p-0">{idCardTab === 'card' && (<div className="relative w-[400px] h-[250px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white p-6 shadow-2xl flex flex-col justify-between border-2 border-gray-700 print:w-[85.6mm] print:h-[53.98mm] print:border-none print:shadow-none print:rounded-lg overflow-hidden"><div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div><div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-red-600 rounded-full opacity-20 blur-3xl"></div><div className="relative z-10 flex justify-between items-start"><div className="flex items-center gap-3"><img src={APP_LOGO} className="w-12 h-12 rounded-full border-2 border-red-600 bg-black object-contain" /><div><h3 className="font-bold text-lg leading-none tracking-wider">MR. ROTTWEILER</h3><p className="text-[8px] text-gray-400 tracking-[0.2em] mt-1">DOG CLUB MEMBER</p></div></div><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://dogclub.ir/dog/${showIDCardModal.id}`} className="w-16 h-16 rounded-lg border-2 border-white" alt="QR" /></div><div className="relative z-10 flex gap-4 mt-4 items-end"><div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-red-600 shadow-lg"><img src={showIDCardModal.image} className="w-full h-full object-cover" /></div><div className="flex-1"><h2 className="text-2xl font-black text-white uppercase tracking-wide">{showIDCardModal.name}</h2><p className="text-xs text-gray-300 uppercase">{showIDCardModal.breed} <span className="mx-1 text-red-500">•</span> {showIDCardModal.age} YEARS</p><div className="mt-2 flex flex-col gap-0.5"><p className="text-[9px] text-gray-400 font-mono flex items-center gap-1"><CreditCard size={10}/> MICROCHIP: <span className="text-white">{showIDCardModal.microchip || 'N/A'}</span></p><p className="text-[9px] text-gray-400 font-mono flex items-center gap-1"><CheckCircle size={10}/> ID: <span className="text-white">{showIDCardModal.id.toUpperCase()}</span></p></div></div></div></div>)}{idCardTab === 'certificate' && (<div className="w-[210mm] h-[297mm] bg-white text-gray-900 p-12 shadow-2xl print:shadow-none relative overflow-hidden print:w-full print:h-auto"><div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"><img src={APP_LOGO} className="w-[500px]" /></div><div className="border-4 border-double border-gray-800 h-full p-8 relative z-10 flex flex-col"><div className="text-center border-b-2 border-gray-800 pb-6 mb-8"><div className="flex justify-center mb-4"><img src={APP_LOGO} className="w-24 h-24 object-contain" /></div><h1 className="text-4xl font-black tracking-widest mb-2 uppercase">Official Pedigree & ID</h1><h2 className="text-xl font-serif text-gray-600">شناسنامه رسمی سگ</h2></div><div className="flex gap-8 mb-8"><div className="w-48 h-48 border-4 border-gray-200 shadow-inner bg-gray-50 flex items-center justify-center overflow-hidden rounded-lg"><img src={showIDCardModal.image} className="w-full h-full object-cover" /></div><div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-12 content-start"><div className="border-b border-gray-300 pb-1"><span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Name / نام</span><span className="text-xl font-bold">{showIDCardModal.name}</span></div><div className="border-b border-gray-300 pb-1"><span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Breed / نژاد</span><span className="text-xl font-bold">{showIDCardModal.breed}</span></div><div className="border-b border-gray-300 pb-1"><span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Date of Birth / تاریخ تولد</span><span className="text-xl font-bold font-mono">{showIDCardModal.birthDate || '---'}</span></div><div className="border-b border-gray-300 pb-1"><span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Age / سن</span><span className="text-xl font-bold">{showIDCardModal.age} ساله</span></div><div className="border-b border-gray-300 pb-1 col-span-2"><span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Microchip ID / شماره میکروچیپ</span><span className="text-2xl font-mono tracking-widest">{showIDCardModal.microchip || 'NOT REGISTERED'}</span></div></div></div><div className="mb-8"><h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-gray-800 mb-4">اطلاعات مالک (Owner Details)</h3><div className="grid grid-cols-2 gap-6"><div><span className="text-sm text-gray-500">Name:</span><p className="font-bold text-lg">{users.find(u => u.id === showIDCardModal.ownerId)?.name}</p></div><div><span className="text-sm text-gray-500">Contact:</span><p className="font-bold text-lg font-mono">{users.find(u => u.id === showIDCardModal.ownerId)?.phone}</p></div></div></div><div className="flex-1"><h3 className="text-lg font-bold bg-gray-100 p-2 border-l-4 border-gray-800 mb-4">سابقه پزشکی (Medical Status)</h3><div className="grid grid-cols-2 gap-4 text-sm"><div className="flex justify-between border-b border-dashed pb-2"><span>Last Vaccination:</span><span className="font-mono font-bold">{showIDCardModal.lastVaccine}</span></div><div className="flex justify-between border-b border-dashed pb-2"><span>Next Checkup:</span><span className="font-mono font-bold">{showIDCardModal.nextCheckup}</span></div><div className="flex justify-between border-b border-dashed pb-2"><span>Health Status:</span><span className={`font-bold px-2 rounded ${showIDCardModal.status === DogStatus.HEALTHY ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{showIDCardModal.status}</span></div></div></div><div className="mt-auto pt-8 border-t-2 border-gray-800 flex justify-between items-end"><div className="text-center"><div className="h-16 w-32 border-b border-gray-400 mb-2"></div><span className="text-xs uppercase tracking-wider">Club Manager Signature</span></div><div className="text-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://dogclub.ir/dog/${showIDCardModal.id}`} className="w-24 h-24 border-4 border-white shadow-lg" /><span className="text-[10px] uppercase tracking-wider block mt-1">Scan for Profile</span></div><div className="text-center"><div className="h-16 w-32 border-b border-gray-400 mb-2"></div><span className="text-xs uppercase tracking-wider">Vet Signature</span></div></div></div></div>)}</div><div className="mt-4 flex justify-end gap-2 print:hidden"><button onClick={() => setShowIDCardModal(null)} className="px-4 py-2 text-gray-600 border rounded-lg">بستن</button><button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg"><Printer size={20} /> چاپ {idCardTab === 'card' ? 'کارت' : 'شناسنامه'}</button></div></div></div>)}
    </div>
  );
};
