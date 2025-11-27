
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, Activity, DollarSign, Stethoscope, Home, LogOut, BedDouble, CheckSquare, ClipboardList, AlertOctagon, Send, FileText, Archive, Pill, ShoppingCart, Bone, AlertTriangle, Eye, CheckCircle, XCircle, Lock, Syringe, Plus, Trash2, LogIn, UserPlus, Calendar, CreditCard, Wallet, RefreshCw, ArrowRight } from 'lucide-react';
import { DogStatus, UserRole, Dog, TrainingSession, ChecklistItem, DailyChecklist, EmergencyReport, TreatmentPlan, PrescriptionItem, Invoice, InvoiceStatus, PaymentMethod } from '../types';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { financials, users, dogs, currentUser, addTrainerToDog, services, addTrainingSession, rooms, 
    managerTasks, emergencyReports, systemLogs, submitChecklist, addEmergencyReport, assignEmergencyReport, resolveEmergencyReport,
    checkMissedMeals, inventory, createTreatmentPlan, approveTreatmentPlan, rejectTreatmentPlan, administerMedication, finalizeTreatmentOutcome, getDailyMedicalTasks, purchaseRequests, fulfillPurchaseRequest, activeTreatments, invoices, payInvoice, chargeWallet
  } = useApp();
  const navigate = useNavigate();
  
  useEffect(() => {
      if (currentUser?.roles.includes(UserRole.ADMIN) || currentUser?.roles.includes(UserRole.INTERNAL_MANAGER)) {
          checkMissedMeals();
      }
  }, [currentUser, checkMissedMeals]);

  // Modals
  const [trainingModal, setTrainingModal] = useState<Dog | null>(null);
  const [emergencyModal, setEmergencyModal] = useState(false);
  const [assignEmergencyModal, setAssignEmergencyModal] = useState<EmergencyReport | null>(null);
  const [showSystemLogsModal, setShowSystemLogsModal] = useState(false);
  const [showVetModal, setShowVetModal] = useState<{ id?: string; title: string; description: string; dogName?: string; dogId?: string } | null>(null);
  const [showOutcomeModal, setShowOutcomeModal] = useState<TreatmentPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<Invoice | null>(null);
  
  // Recharge State
  const [showRechargeAlert, setShowRechargeAlert] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);

  // Forms
  const [trainingForm, setTrainingForm] = useState({ skills: '', duration: 30, performance: 'Good', notes: '' });
  const [emergencyForm, setEmergencyForm] = useState({ title: '', description: '', urgency: 'Medium', dogId: '' });
  const [emergencyAssignForm, setEmergencyAssignForm] = useState({ userId: '', note: '' });
  const [outcomeForm, setOutcomeForm] = useState({ result: 'CURED', notes: '' });
  const [paymentForm, setPaymentForm] = useState<{ amount: string, method: PaymentMethod }>({ amount: '', method: PaymentMethod.ONLINE });

  // Checklist State
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [checklistNotes, setChecklistNotes] = useState<Record<string, string>>({});

  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);
  const isManager = currentUser?.roles.includes(UserRole.INTERNAL_MANAGER) || isAdmin;
  const isVet = currentUser?.roles.includes(UserRole.VET) || isAdmin;
  const isTrainer = currentUser?.roles.includes(UserRole.TRAINER) || isAdmin;
  const isReceptionist = currentUser?.roles.includes(UserRole.RECEPTIONIST) || isAdmin;
  const isClient = currentUser?.roles.includes(UserRole.CLIENT);
  
  const canViewOperations = isAdmin || isManager || isVet || isReceptionist;
  const canViewFinancials = isAdmin || currentUser?.permissions.manageFinance;

  // Filtered Data
  const trainerDogs = dogs.filter(d => { if (isAdmin) return true; return d.trainers?.some(t => t.trainerId === currentUser?.id); });
  const activeEmergencies = emergencyReports.filter(r => r.status !== 'RESOLVED');
  const resolvedEmergencies = emergencyReports.filter(r => r.status === 'RESOLVED');
  
  // Client Data
  const myPendingInvoices = useMemo(() => invoices.filter(i => i.userId === currentUser?.id && i.status !== InvoiceStatus.PAID), [invoices, currentUser]);
  const myDogs = useMemo(() => dogs.filter(d => d.ownerId === currentUser?.id), [dogs, currentUser]);

  // ... other useMemos remain same
  const myAssignedEmergencies = useMemo(() => {
      if (isAdmin) { return emergencyReports.filter(r => r.status === 'ASSIGNED' || (r.status === 'OPEN' && r.targetRole)); }
      return emergencyReports.filter(r => {
          const isDirectlyAssigned = r.assignedToId === currentUser?.id && r.status === 'ASSIGNED';
          const isTargetedToMyRole = r.status === 'OPEN' && r.targetRole && currentUser?.roles.includes(r.targetRole);
          return isDirectlyAssigned || isTargetedToMyRole;
      });
  }, [emergencyReports, isAdmin, currentUser]);
      
  const dailyMedicalTasks = (isManager || isAdmin) ? getDailyMedicalTasks() : [];
  const pendingPurchaseRequests = purchaseRequests.filter(r => r.status === 'PENDING');
  const pendingTreatmentPlans = activeTreatments.filter(p => p.approvalStatus === 'PENDING_APPROVAL');
  const finishedTreatments = activeTreatments.filter(p => p.status === 'WAITING_FOR_RESULT' && p.approvalStatus === 'APPROVED');
  const activeDogsForVet = useMemo(() => dogs.filter(d => d.status !== DogStatus.CHECKED_OUT), [dogs]);
  const roomStatusData = useMemo(() => {
      const today = new Date().toLocaleDateString('fa-IR');
      return rooms.map(room => {
          const occupants = dogs.filter(d => room.occupiedBy.includes(d.id));
          const isPendingCheckout = occupants.some(d => d.checkoutDate === today);
          const isOccupied = occupants.length > 0;
          let status: 'Available' | 'Occupied' | 'PendingCheckout' = 'Available';
          if (isPendingCheckout) status = 'PendingCheckout'; else if (isOccupied) status = 'Occupied';
          return { room, status, occupants };
      });
  }, [rooms, dogs]);
  const dailyTraffic = useMemo(() => {
      const today = new Date().toLocaleDateString('fa-IR');
      const arrivals = dogs.filter(d => d.admissionDate === today);
      const departures = dogs.filter(d => d.checkoutDate === today && d.status !== DogStatus.CHECKED_OUT);
      return { arrivals, departures };
  }, [dogs]);

  const handleSubmitChecklist = () => { if (!currentUser) return; const items: ChecklistItem[] = managerTasks.filter(t => t.isEnabled).map(t => ({ taskId: t.id, title: t.title, isDone: checklistState[t.id] || false, note: checklistNotes[t.id] })); const checklist: DailyChecklist = { id: `chk_${Date.now()}`, date: new Date().toLocaleDateString('fa-IR'), managerId: currentUser.id, managerName: currentUser.name, items: items, verifiedByAdmin: false, submissionTime: new Date().toLocaleTimeString('fa-IR') }; submitChecklist(checklist); setChecklistState({}); setChecklistNotes({}); alert('چک‌لیست روزانه با موفقیت ثبت شد.'); };
  const handleEmergencySubmit = (e: React.FormEvent) => { e.preventDefault(); if(!currentUser) return; const selectedDog = dogs.find(d => d.id === emergencyForm.dogId); const report: EmergencyReport = { id: `em_${Date.now()}`, title: emergencyForm.title, description: emergencyForm.description, urgency: emergencyForm.urgency as any, reportedBy: currentUser.name, reportedAt: new Date().toLocaleString('fa-IR'), status: 'OPEN', dogId: emergencyForm.dogId || undefined, dogName: selectedDog?.name || undefined }; addEmergencyReport(report); setEmergencyModal(false); setEmergencyForm({ title: '', description: '', urgency: 'Medium', dogId: '' }); alert('گزارش اضطراری ثبت و به مدیر کل ارجاع شد.'); };
  const handleAssignEmergency = (e: React.FormEvent) => { e.preventDefault(); if(!assignEmergencyModal || !emergencyAssignForm.userId) return; const user = users.find(u => u.id === emergencyAssignForm.userId); if(user) { assignEmergencyReport(assignEmergencyModal.id, user.id, user.name, emergencyAssignForm.note); setAssignEmergencyModal(null); alert(`ماموریت به ${user.name} ارجاع شد.`); } };
  const handleVetPlanSubmit = (planData: { dogId: string, diagnosis: string, duration: number, meds: PrescriptionItem[], notes: string }) => { if (!currentUser) return; const plan: TreatmentPlan = { id: `tp_${Date.now()}`, dogId: planData.dogId, vetId: currentUser.id, diagnosis: planData.diagnosis, startDate: new Date().toLocaleDateString('fa-IR'), endDate: '1403/XX/XX', durationDays: planData.duration, status: 'ACTIVE', approvalStatus: 'PENDING_APPROVAL', notes: planData.notes, medications: planData.meds }; createTreatmentPlan(plan); if (showVetModal && showVetModal.id) resolveEmergencyReport(showVetModal.id); setShowVetModal(null); alert(plan.medications.length > 0 ? 'نسخه حرفه‌ای ثبت شد و جهت تایید به مدیر کل ارسال گردید.' : 'دستور استراحت/تحت نظر برای سگ ثبت شد.'); };
  const handleAddTrainingSession = (e: React.FormEvent) => { e.preventDefault(); if (!trainingModal || !currentUser) return; const newSession: TrainingSession = { id: `ts_${Date.now()}`, date: new Date().toLocaleDateString('fa-IR'), duration: Number(trainingForm.duration), skillsTaught: trainingForm.skills, performance: trainingForm.performance as any, trainerNotes: trainingForm.notes, trainerId: currentUser.id, trainerName: currentUser.name }; addTrainingSession(trainingModal.id, newSession); setTrainingModal(null); setTrainingForm({ skills: '', duration: 30, performance: 'Good', notes: '' }); alert('جلسه آموزشی ثبت شد.'); };
  const handleOutcomeSubmit = (e: React.FormEvent) => { e.preventDefault(); if(!showOutcomeModal) return; finalizeTreatmentOutcome(showOutcomeModal.id, outcomeForm.result as any, outcomeForm.notes); setShowOutcomeModal(null); setOutcomeForm({ result: 'CURED', notes: '' }); alert('نتیجه درمان ثبت و وضعیت سگ بروزرسانی شد.'); };
  
  const handleClientPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if(!showPaymentModal) return;
      const amt = Number(paymentForm.amount);
      if (amt <= 0) { alert('مبلغ نامعتبر است'); return; }
      if (amt > (showPaymentModal.finalAmount - (showPaymentModal.paidAmount || 0))) { alert('مبلغ وارد شده بیشتر از بدهی باقیمانده است'); return; }
      
      // Smart Wallet Check
      if (paymentForm.method === PaymentMethod.WALLET) {
          const currentBalance = currentUser?.balance || 0;
          if (currentBalance < amt) {
              const shortfall = amt - currentBalance;
              setRechargeAmount(shortfall);
              setShowRechargeAlert(true);
              return; // Stop payment flow to allow recharge
          }
      }

      const result = payInvoice(showPaymentModal.id, paymentForm.method, amt);
      if (result.success) {
          setShowPaymentModal(null);
          setPaymentForm({ amount: '', method: PaymentMethod.ONLINE });
          alert('پرداخت با موفقیت انجام شد.');
      } else {
          alert(result.message);
      }
  };

  const handleRechargeAndPay = () => {
      if (!showPaymentModal) return;
      
      // Use ATOMIC Recharge & Pay function via updated payInvoice signature
      // passing rechargeAmount triggers the atomic logic in AppContext
      const amt = Number(paymentForm.amount);
      const result = payInvoice(showPaymentModal.id, PaymentMethod.WALLET, amt, rechargeAmount);
      
      if (result.success) {
          setShowRechargeAlert(false);
          setShowPaymentModal(null);
          setPaymentForm({ amount: '', method: PaymentMethod.ONLINE });
          alert(`کیف پول مبلغ ${new Intl.NumberFormat('fa-IR').format(rechargeAmount)} تومان شارژ شد و فاکتور با موفقیت پرداخت گردید.`);
      } else {
          alert('خطا در عملیات: ' + result.message);
      }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between border border-gray-700"><div><h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><span className="bg-red-600/20 text-red-500 p-1 rounded-lg"><Activity size={20}/></span> سلام {currentUser?.name}</h2><p className="text-gray-300 max-w-2xl text-sm">به پنل مدیریت Mr. Rottweiler خوش آمدید.</p>{isAdmin && <span className="inline-block mt-2 px-2 py-0.5 bg-blue-600/50 rounded text-xs">دسترسی کامل مدیر کل</span>}</div>{canViewFinancials && (<button onClick={() => navigate('/finance')} className="hidden md:block px-6 py-2 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">گزارش مالی</button>)}</div>

      {/* --- CLIENT DASHBOARD --- */}
      {isClient && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. My Pending Invoices */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><CreditCard size={20} className="text-indigo-500"/> صورت‌حساب‌های من</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                      {myPendingInvoices.map(inv => {
                          const remaining = inv.finalAmount - (inv.paidAmount || 0);
                          return (
                              <div key={inv.id} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <p className="font-bold text-sm text-indigo-900 dark:text-indigo-200">{inv.serviceName || 'خدمات باشگاه'}</p>
                                          <p className="text-xs text-indigo-600 dark:text-indigo-300">{inv.date}</p>
                                      </div>
                                      <span className="bg-white dark:bg-gray-800 text-indigo-600 px-2 py-1 rounded text-xs font-bold shadow-sm">بدهی: {new Intl.NumberFormat('fa-IR').format(remaining)} ت</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <div className="text-xs text-gray-500">
                                          کل: {new Intl.NumberFormat('fa-IR').format(inv.finalAmount)} | پرداخت شده: {new Intl.NumberFormat('fa-IR').format(inv.paidAmount || 0)}
                                      </div>
                                      <button 
                                          onClick={() => { setShowPaymentModal(inv); setPaymentForm({ amount: remaining.toString(), method: PaymentMethod.ONLINE }); }}
                                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                                      >
                                          پرداخت
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                      {myPendingInvoices.length === 0 && <p className="text-sm text-gray-400 text-center py-8">شما هیچ فاکتور پرداخت نشده‌ای ندارید.</p>}
                  </div>
              </div>

              {/* 2. My Wallet & Quick Info */}
              <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <p className="text-emerald-100 text-sm mb-1">موجودی کیف پول شما</p>
                              <h3 className="text-3xl font-black">{new Intl.NumberFormat('fa-IR').format(currentUser?.balance || 0)} <span className="text-sm font-normal">تومان</span></h3>
                          </div>
                          <div className="bg-white/20 p-2 rounded-xl"><Wallet size={24}/></div>
                      </div>
                      <button className="w-full py-2 bg-white text-green-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">افزایش موجودی (شارژ)</button>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><Bone size={20} className="text-amber-500"/> سگ‌های من</h3>
                      <div className="space-y-2">
                          {myDogs.map(d => (
                              <div key={d.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/dogs')}>
                                  <img src={d.image} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                  <div>
                                      <p className="text-sm font-bold dark:text-white">{d.name}</p>
                                      <p className="text-xs text-gray-500">{d.status}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ... Receptionist, Manager, Vet, Trainer sections remain unchanged ... */}
      {isReceptionist && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"><div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><BedDouble size={20} className="text-indigo-500"/> میز پذیرش: وضعیت اتاق‌های پانسیون</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{roomStatusData.map(({ room, status, occupants }) => (<div key={room.id} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-default min-h-[90px] ${status === 'Available' ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' : ''} ${status === 'Occupied' ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800' : ''} ${status === 'PendingCheckout' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800' : ''}`}><div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{room.name}</div>{status === 'Available' && <CheckCircle className="text-green-500 mb-1" size={20} />}{status === 'Occupied' && <Lock className="text-red-500 mb-1" size={20} />}{status === 'PendingCheckout' && <LogOut className="text-amber-500 mb-1 animate-pulse" size={20} />}<div className="text-[9px] font-bold truncate w-full px-1 text-gray-700 dark:text-gray-300">{status === 'Available' ? 'آزاد' : occupants.map(d => d.name).join(', ')}</div></div>))}</div></div><div className="space-y-6"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-blue-500"/> تردد امروز</h3><div className="space-y-4"><div><p className="text-xs text-gray-500 mb-2 font-bold">ورودی‌های جدید</p>{dailyTraffic.arrivals.length > 0 ? (<ul className="space-y-1">{dailyTraffic.arrivals.map(d => <li key={d.id} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex justify-between"><span>{d.name}</span><span>{d.breed}</span></li>)}</ul>) : <p className="text-xs text-gray-400 italic">موردی ثبت نشده</p>}</div><div><p className="text-xs text-gray-500 mb-2 font-bold">خروجی‌های امروز</p>{dailyTraffic.departures.length > 0 ? (<ul className="space-y-1">{dailyTraffic.departures.map(d => <li key={d.id} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded flex justify-between"><span>{d.name}</span><span>ترخیص</span></li>)}</ul>) : <p className="text-xs text-gray-400 italic">موردی برای خروج نیست</p>}</div></div></div><div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border dark:border-gray-700"><h4 className="font-bold dark:text-white mb-3 text-sm">دسترسی سریع</h4><div className="grid grid-cols-2 gap-2"><button onClick={() => navigate('/dogs')} className="bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex flex-col items-center justify-center gap-1"><LogIn size={16}/>پذیرش سگ</button><button onClick={() => navigate('/users')} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-xs font-bold border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col items-center justify-center gap-1"><UserPlus size={16}/>ثبت مشتری</button></div></div></div></div>)}
      {isManager && !isReceptionist && (<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"><h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><BedDouble size={20} className="text-indigo-500"/> وضعیت اتاق‌های پانسیون (مدیریت داخلی)</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{roomStatusData.map(({ room, status, occupants }) => (<div key={room.id} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all hover:scale-105 cursor-default min-h-[100px] ${status === 'Available' ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' : ''} ${status === 'Occupied' ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800' : ''} ${status === 'PendingCheckout' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800' : ''}`}><div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{room.name}</div>{status === 'Available' && <CheckCircle className="text-green-500 mb-1" size={24} />}{status === 'Occupied' && <Lock className="text-red-500 mb-1" size={24} />}{status === 'PendingCheckout' && <LogOut className="text-amber-500 mb-1 animate-pulse" size={24} />}<div className="text-[10px] font-bold truncate w-full px-1 text-gray-700 dark:text-gray-300">{status === 'Available' ? 'آزاد' : occupants.map(d => d.name).join(', ')}</div></div>))}</div></div>)}
      {activeEmergencies.length > 0 && canViewOperations && (<div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 animate-pulse-slow"><h3 className="text-red-700 dark:text-red-300 font-bold flex items-center gap-2"><AlertOctagon size={20}/> هشدارهای اضطراری فعال</h3><div className="space-y-2">{activeEmergencies.map(em => (<div key={em.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center border-r-4 border-red-500"><div><span className="font-bold dark:text-white text-sm">{em.title}</span><span className="text-xs text-gray-500 mx-2">({em.reportedBy} - {em.reportedAt})</span><p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{em.description}</p>{em.dogName && <p className="text-xs font-bold text-blue-600 mt-1">سگ مربوطه: {em.dogName}</p>}{em.targetRole && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded ml-2">نقش هدف: {em.targetRole}</span>}</div><div className="flex items-center gap-2">{em.status === 'OPEN' && isAdmin && (<button onClick={() => setAssignEmergencyModal(em)} className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 flex items-center gap-1"><Send size={12} /> ارجاع به پرسنل</button>)}{em.status === 'ASSIGNED' && (<span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">در حال انجام توسط: {em.assignedToName}</span>)}</div></div>))}</div></div>)}
      {isAdmin && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white flex items-center gap-2"><Stethoscope size={20} className="text-green-500"/> بررسی نسخه‌های پزشکی</h3><span className="bg-amber-100 text-amber-600 px-2 py-1 rounded text-xs font-bold">{pendingTreatmentPlans.length} نسخه جدید</span></div><div className="space-y-3 max-h-60 overflow-y-auto">{pendingTreatmentPlans.map(plan => { const dog = dogs.find(d => d.id === plan.dogId); return (<div key={plan.id} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/50"><div className="flex justify-between mb-1"><p className="font-bold text-sm dark:text-white">{dog?.name} <span className="text-xs font-normal text-gray-500">(تشخیص: {plan.diagnosis})</span></p></div>{plan.medications.length > 0 ? (<ul className="text-xs text-gray-600 dark:text-gray-300 mb-2 pl-2 border-l-2 border-gray-300 dark:border-gray-600">{plan.medications.map((m, i) => (<li key={i}>{m.name} - <b>{m.dosageQuantity} {m.unit}</b> ({m.route}) - {m.frequencyDescription}</li>))}</ul>) : (<p className="text-xs text-blue-600 italic mb-2">تجویز استراحت و مراقبت (بدون دارو)</p>)}{plan.notes && <p className="text-xs text-gray-500 mb-2">یادداشت: {plan.notes}</p>}<div className="flex gap-2 justify-end"><button onClick={() => rejectTreatmentPlan(plan.id)} className="px-3 py-1 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50">رد</button><button onClick={() => { approveTreatmentPlan(plan.id); alert('طرح درمان تایید و برای مدیر داخلی فعال شد.'); }} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">تایید و ابلاغ</button></div></div>);})}{pendingTreatmentPlans.length === 0 && <p className="text-sm text-gray-400 text-center py-4">نسخه‌ای برای تایید موجود نیست.</p>}</div></div><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white flex items-center gap-2"><CheckCircle size={20} className="text-blue-500"/> بررسی نتایج درمان</h3><span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">{finishedTreatments.length} مورد تکمیل شده</span></div><div className="space-y-3 max-h-60 overflow-y-auto">{finishedTreatments.map(plan => { const dog = dogs.find(d => d.id === plan.dogId); return (<div key={plan.id} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50 flex justify-between items-center"><div><p className="font-bold text-sm dark:text-white">{dog?.name}</p><p className="text-xs text-gray-500">تشخیص: {plan.diagnosis}</p><p className="text-xs text-blue-600 mt-1">دوره درمان به پایان رسید</p></div><button onClick={() => setShowOutcomeModal(plan)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 shadow">ثبت نتیجه نهایی</button></div>);})}{finishedTreatments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">موردی برای بررسی وجود ندارد.</p>}</div></div><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2"><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white flex items-center gap-2"><ShoppingCart size={20}/> کارتابل خرید دارو/کالا</h3><span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">{pendingPurchaseRequests.length} درخواست جدید</span></div><div className="space-y-3 max-h-60 overflow-y-auto">{pendingPurchaseRequests.map(req => (<div key={req.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex justify-between items-center"><div><p className="font-bold text-sm dark:text-white">{req.itemName}</p><p className="text-xs text-gray-500">درخواست: {req.requestedBy} | {req.requestDate}</p><p className="text-xs text-red-500 mt-1">{req.reason}</p></div><button onClick={() => { fulfillPurchaseRequest(req.id); alert('وضعیت درخواست به "خریداری شده" تغییر یافت.'); }} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">تایید خرید</button></div>))}{pendingPurchaseRequests.length === 0 && <p className="text-sm text-gray-400 text-center">درخواست خریدی موجود نیست.</p>}</div></div></div>)}
      {(myAssignedEmergencies.length > 0) && (<div className="grid grid-cols-1 gap-6"><div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6"><h3 className="font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2"><ClipboardList size={20}/> {isAdmin ? 'همه ماموریت‌های فعال' : 'ماموریت‌ها و وظایف من'}</h3><div className="space-y-3">{myAssignedEmergencies.map(em => (<div key={em.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex justify-between items-center"><div><h4 className="font-bold dark:text-white">{em.title}</h4><p className="text-sm text-gray-600 dark:text-gray-300">{em.description}</p>{em.dogName && <p className="text-xs font-bold text-blue-600 mt-1">سگ مربوطه: {em.dogName}</p>}{em.adminNote && <div className="text-xs text-gray-500 mt-1">دستور مدیریت: {em.adminNote}</div>}{em.targetRole && em.status === 'OPEN' && (<span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded mt-1 inline-block">ارجاع سیستمی به نقش: {em.targetRole}</span>)}{isAdmin && em.assignedToName && <span className="text-xs text-blue-500 block mt-1">ارجاع شده به: {em.assignedToName}</span>}</div><div className="flex gap-2">{(isVet) && (<button onClick={() => setShowVetModal(em)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"><Stethoscope size={16}/> ویزیت / اقدام</button>)}{(!isVet || em.targetRole) && (<button onClick={() => { resolveEmergencyReport(em.id); alert('ماموریت پایان یافت.'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"><CheckCircle size={16}/> انجام شد</button>)}</div></div>))}</div></div></div>)}
      {isManager && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-6"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full"><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white flex items-center gap-2"><CheckSquare size={20} className="text-green-600"/> چک‌لیست وظایف {isAdmin && <span className="text-xs font-normal text-gray-500">(نمای مدیر داخلی)</span>}</h3></div><div className="space-y-3 flex-1 max-h-96 overflow-y-auto mb-4">{managerTasks.filter(t => t.isEnabled).map(task => (<div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600"><input type="checkbox" checked={checklistState[task.id] || false} onChange={(e) => setChecklistState({...checklistState, [task.id]: e.target.checked})} className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"/><div className="flex-1"><p className={`text-sm font-medium dark:text-white ${checklistState[task.id] ? 'line-through text-gray-400' : ''}`}>{task.title}</p><span className="text-[10px] text-gray-500 bg-white dark:bg-gray-800 px-1.5 rounded border dark:border-gray-600">{task.category}</span></div></div>))}{managerTasks.length === 0 && <div className="text-center py-8 text-gray-400"><ClipboardList size={48} className="mx-auto mb-2 opacity-20"/><p>هیچ وظیفه‌ای توسط مدیر کل تعریف نشده است.</p></div>}</div><button onClick={handleSubmitChecklist} disabled={managerTasks.length === 0} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"><Send size={20} /> ثبت و ارسال گزارش</button></div><button onClick={() => setEmergencyModal(true)} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 animate-pulse-slow"><AlertTriangle size={24}/> گزارش سگ مشکوک به بیماری</button></div><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold dark:text-white flex items-center gap-2 mb-4"><Pill size={20} className="text-red-500"/> وظایف درمانی روزانه</h3><div className="space-y-3 max-h-80 overflow-y-auto">{dailyMedicalTasks.map((task, idx) => (<div key={idx} className={`p-3 rounded-xl border ${task.isFinished ? 'bg-green-50 border-green-100 dark:bg-green-900/10' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'}`}><div className="flex justify-between mb-2"><span className="font-bold text-sm dark:text-white">{task.dog.name}</span><span className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm">{task.dog.roomId || 'بدون اتاق'}</span></div><div className="space-y-2">{task.isFinished ? (<div className="text-center text-green-600 dark:text-green-400 text-xs font-bold bg-white dark:bg-gray-800 p-2 rounded">پایان روند درمان - منتظر بررسی مدیر</div>) : task.meds.length > 0 ? task.meds.map((m, i) => (<div key={i} className="bg-white dark:bg-gray-800 p-2 rounded-lg text-xs"><div className="flex justify-between items-start mb-1"><div><p className="font-bold text-gray-800 dark:text-gray-200">{m.name}</p><p className="text-gray-500 mt-0.5"><span className="bg-blue-100 text-blue-800 px-1.5 rounded mr-1">{m.route}</span>مقدار: <b>{m.dosageQuantity} {m.unit}</b> ({m.frequencyDescription})</p></div>{m.needsPurchase ? (<span className="text-red-500 font-bold border border-red-200 px-2 py-1 rounded bg-red-50 text-[10px]">ناموجود</span>) : (<button onClick={() => administerMedication(task.planId, m.id)} className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1"><Syringe size={14}/> مصرف</button>)}</div>{m.totalDoses && (<div className="w-full bg-gray-200 rounded-full h-1 mt-1"><div className="bg-blue-600 h-1 rounded-full" style={{ width: `${Math.min(((m.administeredCount || 0) / m.totalDoses) * 100, 100)}%` }}></div></div>)}</div>)) : (<p className="text-xs text-blue-600 text-center bg-blue-50 p-2 rounded">تجویز استراحت و مراقبت (بدون دارو)</p>)}</div></div>))}{dailyMedicalTasks.length === 0 && <p className="text-sm text-gray-400 text-center py-8">امروز وظیفه درمانی فعالی وجود ندارد.</p>}</div></div></div>)}
      {isVet && (<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-6"><h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><Eye size={20} className="text-blue-500"/> لیست کلی سگ‌های حاضر (ویزیت اختیاری)</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">{activeDogsForVet.map(dog => (<div key={dog.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600"><div><p className="font-bold text-sm dark:text-white">{dog.name}</p><p className="text-xs text-gray-500">{dog.breed} - {dog.roomId ? rooms.find(r=>r.id===dog.roomId)?.name : 'بدون اتاق'}</p></div><button onClick={() => setShowVetModal({ title: 'ویزیت دوره‌ای / اختیاری', description: 'ویزیت توسط دامپزشک در بخش', dogName: dog.name, dogId: dog.id })} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Stethoscope size={14}/> معاینه</button></div>))}</div></div>)}
      {isTrainer && (<div className="space-y-6"><div className="flex justify-between items-center"><h3 className="font-bold text-xl dark:text-white flex items-center gap-2"><Bone className="text-blue-600"/> سگ‌های تحت آموزش من <span className="text-sm font-normal text-gray-500">({trainerDogs.length})</span></h3></div>{trainerDogs.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{trainerDogs.map(dog => { const myAssignment = dog.trainers?.find(t => isAdmin ? true : t.trainerId === currentUser?.id); const specialty = myAssignment?.specialty || 'عمومی'; const commission = myAssignment?.commission || 0; return (<div key={dog.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden"><div className="relative h-40"><img src={dog.image} alt={dog.name} className="w-full h-full object-cover" /><div className="absolute top-2 right-2"><span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-blue-100 text-blue-700 border-blue-200">{specialty}</span></div></div><div className="p-4 flex-1 flex flex-col"><div className="flex justify-between items-start mb-2"><h4 className="font-bold dark:text-white text-lg">{dog.name}</h4><span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{dog.breed}</span></div><div className="text-xs text-gray-500 mb-4 space-y-1"><div className="flex justify-between"><span>جلسات انجام شده:</span><span className="font-bold text-gray-700 dark:text-gray-200">{dog.trainingSessions?.length || 0}</span></div><div className="flex justify-between"><span>درآمد (پورسانت):</span><span className="font-bold text-green-600">{new Intl.NumberFormat('fa-IR').format(commission)} ت</span></div></div><button onClick={() => setTrainingModal(dog)} className="w-full mt-auto py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-2"><FileText size={14}/> ثبت جلسه تمرینی</button></div></div>); })}</div>) : (<div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl text-center border-2 border-dashed border-blue-200 dark:border-blue-800"><Bone className="w-16 h-16 mx-auto text-blue-300 mb-4" size={64}/><p className="text-blue-700 dark:text-blue-300 font-bold">هنوز سگی برای آموزش به شما اختصاص داده نشده است.</p></div>)}</div>)}

      {/* --- MODALS --- */}
      {emergencyModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full animate-fade-in border-t-4 border-red-600"><h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2"><AlertTriangle size={24}/> گزارش وضعیت اضطراری</h3><form onSubmit={handleEmergencySubmit} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">انتخاب سگ (اختیاری)</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={emergencyForm.dogId} onChange={(e) => setEmergencyForm({...emergencyForm, dogId: e.target.value})}><option value="">انتخاب کنید...</option>{dogs.filter(d => d.status !== DogStatus.CHECKED_OUT).map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}</select></div><div><label className="block text-xs mb-1 dark:text-gray-300">عنوان موضوع</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={emergencyForm.title} onChange={e => setEmergencyForm({...emergencyForm, title: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">سطح فوریت</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={emergencyForm.urgency} onChange={e => setEmergencyForm({...emergencyForm, urgency: e.target.value})}><option value="High">بسیار فوری</option><option value="Medium">فوری</option><option value="Low">معمولی</option></select></div><div><label className="block text-xs mb-1 dark:text-gray-300">شرح کامل</label><textarea required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24" value={emergencyForm.description} onChange={e => setEmergencyForm({...emergencyForm, description: e.target.value})}></textarea></div><div className="flex gap-2"><button type="button" onClick={() => setEmergencyModal(false)} className="flex-1 py-2 text-gray-500">انصراف</button><button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">ثبت گزارش</button></div></form></div></div>)}
      {showOutcomeModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-2xl"><h3 className="font-bold dark:text-white mb-4 text-lg">ثبت نتیجه نهایی درمان</h3><form onSubmit={handleOutcomeSubmit} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">نتیجه درمان</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={outcomeForm.result} onChange={e => setOutcomeForm({...outcomeForm, result: e.target.value})}><option value="CURED">بهبود کامل</option><option value="PARTIAL">بهبود نسبی</option><option value="NOT_CURED">عدم بهبود</option></select></div><div><label className="block text-xs mb-1 dark:text-gray-300">توضیحات تکمیلی</label><textarea className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24" value={outcomeForm.notes} onChange={e => setOutcomeForm({...outcomeForm, notes: e.target.value})}></textarea></div><div className="flex gap-2"><button type="button" onClick={() => setShowOutcomeModal(null)} className="flex-1 py-2 text-gray-500 border rounded-lg">لغو</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">ثبت نهایی</button></div></form></div></div>)}
      {showVetModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full animate-fade-in max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2"><ClipboardList size={24}/> تجویز و طرح درمان</h3><button onClick={() => setShowVetModal(null)}><XCircle className="text-gray-500"/></button></div><div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg mb-4 text-sm"><p><strong>موضوع ارجاع:</strong> {showVetModal.title}</p><p><strong>توضیحات:</strong> {showVetModal.description}</p>{showVetModal.dogName && <p className="mt-1 text-blue-600 font-bold">بیمار: {showVetModal.dogName}</p>}</div><VetPrescriptionForm inventory={inventory} onSubmit={handleVetPlanSubmit} defaultDogName={showVetModal.dogName || showVetModal.description} dogs={dogs} /></div></div>)}
      {showSystemLogsModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full h-[80vh] flex flex-col animate-fade-in"><div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white flex items-center gap-2"><Archive size={20}/> بایگانی و لاگ‌های سیستم</h3><button onClick={() => setShowSystemLogsModal(false)}><XCircle size={24} className="text-gray-500"/></button></div><div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border dark:border-gray-700"><table className="w-full text-right text-sm"><thead className="text-gray-500 border-b dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-900"><tr><th className="p-3">زمان</th><th className="p-3">دسته</th><th className="p-3">کاربر</th><th className="p-3">عملیات</th><th className="p-3">شرح</th></tr></thead><tbody className="divide-y dark:divide-gray-800 text-gray-700 dark:text-gray-300">{systemLogs.map(log => (<tr key={log.id} className="hover:bg-gray-100 dark:hover:bg-gray-800"><td className="p-3 whitespace-nowrap text-xs font-mono">{log.timestamp}</td><td className="p-3"><span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">{log.category}</span></td><td className="p-3">{log.performedBy}</td><td className="p-3 font-bold">{log.action}</td><td className="p-3">{log.description}</td></tr>))}</tbody></table></div></div></div>)}
      {trainingModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full animate-fade-in"><h3 className="font-bold dark:text-white mb-4">ثبت جلسه آموزشی برای {trainingModal.name}</h3><form onSubmit={handleAddTrainingSession} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">مهارت‌های کار شده</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={trainingForm.skills} onChange={e => setTrainingForm({...trainingForm, skills: e.target.value})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">مدت زمان (دقیقه)</label><input type="number" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={trainingForm.duration} onChange={e => setTrainingForm({...trainingForm, duration: Number(e.target.value)})} /></div><div><label className="block text-xs mb-1 dark:text-gray-300">عملکرد</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={trainingForm.performance} onChange={e => setTrainingForm({...trainingForm, performance: e.target.value})}><option value="Excellent">عالی</option><option value="Good">خوب</option><option value="Average">متوسط</option><option value="Poor">ضعیف</option></select></div><div><label className="block text-xs mb-1 dark:text-gray-300">یادداشت مربی</label><textarea className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24" value={trainingForm.notes} onChange={e => setTrainingForm({...trainingForm, notes: e.target.value})}></textarea></div><div className="flex gap-2"><button type="button" onClick={() => setTrainingModal(null)} className="flex-1 py-2 text-gray-500">لغو</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">ثبت</button></div></form></div></div>)}
      {assignEmergencyModal && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in"><h3 className="font-bold dark:text-white mb-4">ارجاع ماموریت اضطراری</h3><p className="text-sm text-gray-500 mb-4">موضوع: {assignEmergencyModal.title}</p><form onSubmit={handleAssignEmergency} className="space-y-4"><div><label className="block text-xs mb-1 dark:text-gray-300">انتخاب پرسنل</label><select required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={emergencyAssignForm.userId} onChange={e => setEmergencyAssignForm({...emergencyAssignForm, userId: e.target.value})}><option value="">انتخاب کنید...</option>{users.filter(u => [UserRole.VET, UserRole.TRAINER, UserRole.STAFF, UserRole.INTERNAL_MANAGER].some(r => u.roles.includes(r))).map(u => (<option key={u.id} value={u.id}>{u.name} ({u.roles.join(', ')})</option>))}</select></div><div><label className="block text-xs mb-1 dark:text-gray-300">دستور کار / یادداشت</label><textarea className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={emergencyAssignForm.note} onChange={e => setEmergencyAssignForm({...emergencyAssignForm, note: e.target.value})} placeholder="اقدام فوری جهت..." required></textarea></div><div className="flex gap-2"><button type="button" onClick={() => setAssignEmergencyModal(null)} className="flex-1 py-2 text-gray-500">لغو</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Send size={20} /> ارجاع</button></div></form></div></div>)}
      
      {/* Payment Modal (Client) */}
      {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-2xl relative">
                  <h3 className="font-bold dark:text-white mb-4">پرداخت صورت‌حساب</h3>
                  
                  {/* Smart Recharge Alert Overlay within Payment Modal */}
                  {showRechargeAlert && (
                      <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 rounded-2xl p-6 flex flex-col animate-fade-in">
                          <div className="flex-1 text-center flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4"><Wallet size={32}/></div>
                              <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">موجودی کافی نیست!</h4>
                              <p className="text-sm text-gray-500 mb-4">برای پرداخت این فاکتور، کیف پول شما مبلغ <span className="text-red-600 font-bold">{new Intl.NumberFormat('fa-IR').format(rechargeAmount)} تومان</span> کم دارد.</p>
                              
                              <div className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-xl mb-4">
                                  <label className="block text-xs text-left mb-1 text-gray-500">مبلغ شارژ (قابل تغییر)</label>
                                  <input 
                                      type="number" 
                                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 text-center font-bold text-lg py-1 focus:outline-none focus:border-blue-500 dark:text-white"
                                      value={rechargeAmount}
                                      onChange={e => setRechargeAmount(Number(e.target.value))}
                                  />
                              </div>
                              
                              <button onClick={handleRechargeAndPay} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-transform hover:scale-105">
                                  <RefreshCw size={18} className="animate-spin-slow"/>
                                  شارژ کیف پول و پرداخت
                              </button>
                              <button onClick={() => setShowRechargeAlert(false)} className="mt-3 text-xs text-gray-500 underline">بازگشت به روش‌های پرداخت</button>
                          </div>
                      </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 text-sm">
                      <p className="flex justify-between"><span>مبلغ کل:</span> <span className="font-bold">{new Intl.NumberFormat('fa-IR').format(showPaymentModal.finalAmount)}</span></p>
                      <p className="flex justify-between mt-1"><span>پرداخت شده:</span> <span className="text-green-600 font-bold">{new Intl.NumberFormat('fa-IR').format(showPaymentModal.paidAmount || 0)}</span></p>
                      <div className="border-t dark:border-gray-600 my-2"></div>
                      <p className="flex justify-between text-indigo-600 font-bold"><span>باقیمانده:</span> <span>{new Intl.NumberFormat('fa-IR').format(showPaymentModal.finalAmount - (showPaymentModal.paidAmount || 0))}</span></p>
                  </div>
                  <form onSubmit={handleClientPayment} className="space-y-4">
                      <div>
                          <label className="block text-xs mb-1 dark:text-gray-300">مبلغ پرداختی (تومان)</label>
                          <input 
                              type="number" 
                              className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold text-center"
                              value={paymentForm.amount}
                              onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-xs mb-1 dark:text-gray-300">روش پرداخت</label>
                          <select 
                              className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={paymentForm.method}
                              onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })}
                          >
                              <option value={PaymentMethod.ONLINE}>درگاه پرداخت آنلاین</option>
                              <option value={PaymentMethod.WALLET}>کسر از کیف پول</option>
                          </select>
                          {paymentForm.method === PaymentMethod.WALLET && (
                              <p className="text-[10px] text-gray-500 mt-1 flex justify-between">
                                  <span>موجودی فعلی:</span>
                                  <span className={currentUser?.balance && currentUser.balance > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                                      {new Intl.NumberFormat('fa-IR').format(currentUser?.balance || 0)}
                                  </span>
                              </p>
                          )}
                      </div>
                      <div className="flex gap-2">
                          <button type="button" onClick={() => setShowPaymentModal(null)} className="flex-1 py-2 text-gray-500 border rounded-lg">لغو</button>
                          <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-1">
                              <CreditCard size={16}/>
                              تایید و پرداخت
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

// Helper Component for Vet Form (unchanged)
const VetPrescriptionForm: React.FC<{ inventory: any[], onSubmit: (data: any) => void, defaultDogName: string, dogs: Dog[] }> = ({ inventory, onSubmit, defaultDogName, dogs }) => {
    const [selectedDogId, setSelectedDogId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [duration, setDuration] = useState(5);
    const [type, setType] = useState<'MED' | 'REST'>('MED');
    const [notes, setNotes] = useState('');
    const [meds, setMeds] = useState<PrescriptionItem[]>([]);
    const [selMedId, setSelMedId] = useState('');
    const [customMedName, setCustomMedName] = useState('');
    const [dosageQty, setDosageQty] = useState(1);
    const [dosageUnit, setDosageUnit] = useState('عدد');
    const [route, setRoute] = useState('Oral');
    const [freq, setFreq] = useState('8');
    useEffect(() => { if (defaultDogName) { const match = dogs.find(d => d.name === defaultDogName); if (match) setSelectedDogId(match.id); } }, [defaultDogName, dogs]);
    const handleAddMed = () => { let medName = customMedName; let invItemId = undefined; if (selMedId) { const item = inventory.find(i => i.id === selMedId); medName = item?.name || ''; invItemId = selMedId; } if (!medName) return; const perDay = 24 / Number(freq); const total = perDay * duration; setMeds([...meds, { id: Math.random().toString(), inventoryItemId: invItemId, name: medName, dosageQuantity: dosageQty, unit: dosageUnit, route: route, frequencyDescription: `هر ${freq} ساعت`, frequencyPerDay: perDay, totalDoses: Math.ceil(total), needsPurchase: !invItemId, administeredCount: 0 }]); setSelMedId(''); setCustomMedName(''); };
    return (
        <div className="space-y-4">
             <div><label className="block text-xs mb-1 dark:text-gray-300">انتخاب سگ بیمار</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={selectedDogId} onChange={e => setSelectedDogId(e.target.value)}><option value="">انتخاب کنید...</option>{dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
             <div className="flex gap-4 border-b dark:border-gray-700 pb-2"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={type === 'MED'} onChange={() => setType('MED')} className="text-blue-600"/> تجویز دارو</label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={type === 'REST'} onChange={() => setType('REST')} className="text-blue-600"/> استراحت / تحت نظر</label></div>
             <div><label className="block text-xs mb-1 dark:text-gray-300">تشخیص (Diagnosis)</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="مثلا: عفونت گوارشی" /></div>
             <div><label className="block text-xs mb-1 dark:text-gray-300">طول دوره درمان (روز)</label><input type="number" min="1" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={duration} onChange={e => setDuration(Number(e.target.value))} /></div>
             {type === 'MED' && (<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800"><h4 className="font-bold text-sm text-blue-800 dark:text-blue-200 mb-2">اقلام دارویی</h4><div className="grid grid-cols-2 gap-2 mb-2"><select className="p-2 rounded border text-xs dark:bg-gray-700 dark:text-white col-span-2" value={selMedId} onChange={e => setSelMedId(e.target.value)}><option value="">انتخاب از انبار...</option>{inventory.filter(i => i.category === 'Medical').map(i => (<option key={i.id} value={i.id}>{i.name} (موجود: {i.quantity} {i.unit})</option>))}</select>{!selMedId && <input type="text" className="p-2 rounded border text-xs dark:bg-gray-700 dark:text-white col-span-2" placeholder="یا نام داروی جدید (خارج از انبار)" value={customMedName} onChange={e => setCustomMedName(e.target.value)} />}<div className="flex items-center gap-1"><input type="number" className="w-16 p-2 rounded border text-xs dark:bg-gray-700 dark:text-white" placeholder="مقدار" value={dosageQty} onChange={e => setDosageQty(Number(e.target.value))} /><input type="text" className="w-16 p-2 rounded border text-xs dark:bg-gray-700 dark:text-white" placeholder="واحد" value={dosageUnit} onChange={e => setDosageUnit(e.target.value)} /></div><select className="p-2 rounded border text-xs dark:bg-gray-700 dark:text-white" value={route} onChange={e => setRoute(e.target.value)}><option value="Oral">خوراکی (Oral)</option><option value="IV">وریدی (IV)</option><option value="IM">عضلانی (IM)</option><option value="SC">زیرجلدی (SC)</option><option value="Topical">موضعی</option></select><select className="p-2 rounded border text-xs dark:bg-gray-700 dark:text-white col-span-2" value={freq} onChange={e => setFreq(e.target.value)}><option value="24">روزانه (q24h)</option><option value="12">هر 12 ساعت (bid)</option><option value="8">هر 8 ساعت (tid)</option><option value="6">هر 6 ساعت (qid)</option></select></div><button type="button" onClick={handleAddMed} className="w-full py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">افزودن به نسخه</button><ul className="mt-3 space-y-1">{meds.map((m, i) => (<li key={i} className="text-xs flex justify-between bg-white dark:bg-gray-800 p-2 rounded"><span>{m.name} - {m.dosageQuantity}{m.unit} - {m.route} - {m.frequencyDescription}</span><button type="button" onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button></li>))}</ul></div>)}
             <div><label className="block text-xs mb-1 dark:text-gray-300">یادداشت / دستورات تکمیلی</label><textarea className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white h-20" value={notes} onChange={e => setNotes(e.target.value)}></textarea></div>
             <button type="button" onClick={() => onSubmit({ dogId: selectedDogId, diagnosis, duration, meds, notes })} disabled={!selectedDogId || (type==='MED' && meds.length === 0)} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold disabled:bg-gray-400 hover:bg-green-700">تایید نهایی و شروع درمان</button>
        </div>
    );
};
