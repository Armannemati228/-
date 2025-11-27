
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryCategory, InventoryItem, UserRole } from '../types';
import { Package, Search, Plus, AlertTriangle, TrendingUp, TrendingDown, History, Filter, Archive, Utensils, Scale, ChefHat, Trash2, Save, CheckCircle, ShoppingCart, X, Edit2 } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { inventory, inventoryTransactions, addInventoryItem, updateInventoryItem, updateStock, produceFoodBatch, productionTolerance, purchaseRequests, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'inventory' | 'kitchen'>('inventory');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<InventoryItem | null>(null);
  const [showStockModal, setShowStockModal] = useState<{ item: InventoryItem, type: 'IN' | 'OUT' } | null>(null);
  
  const isAdmin = currentUser?.roles.includes(UserRole.ADMIN);

  // Kitchen Form State
  const [kitchenIngredients, setKitchenIngredients] = useState<{itemId: string, quantity: number}[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');

  // Forms
  const [newItemForm, setNewItemForm] = useState<Partial<InventoryItem>>({
      name: '', category: 'Food', quantity: 0, unit: 'عدد', minQuantity: 5
  });
  
  // Edit Form State
  const [editItemForm, setEditItemForm] = useState<Partial<InventoryItem>>({});

  const [stockForm, setStockForm] = useState({ quantity: '', description: '', unitPrice: '' });

  useEffect(() => {
      if (showEditModal) {
          setEditItemForm(showEditModal);
      }
  }, [showEditModal]);

  const displayedItems = useMemo(() => {
      return inventory.filter(item => {
          const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
          const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesCategory && matchesSearch;
      });
  }, [inventory, categoryFilter, searchTerm]);

  const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity);
  const pendingPurchases = purchaseRequests.filter(r => r.status === 'PENDING');

  const foodInventory = inventory.filter(i => i.category === 'Food');

  const handleAddItem = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newItemForm.name) return;
      addInventoryItem({
          id: `inv_${Date.now()}`,
          name: newItemForm.name!,
          category: newItemForm.category as InventoryCategory,
          quantity: Number(newItemForm.quantity),
          unit: newItemForm.unit!,
          minQuantity: Number(newItemForm.minQuantity),
          averageCost: 0 
      });
      setShowAddModal(false);
      setNewItemForm({ name: '', category: 'Food', quantity: 0, unit: 'عدد', minQuantity: 5 });
      alert('کالای جدید با موفقیت به انبار اضافه شد.');
  };

  const handleEditItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!showEditModal || !editItemForm.name) return;
      
      const updatedItem: InventoryItem = {
          ...showEditModal,
          name: editItemForm.name!,
          category: editItemForm.category as InventoryCategory,
          unit: editItemForm.unit!,
          minQuantity: Number(editItemForm.minQuantity)
      };
      
      updateInventoryItem(updatedItem);
      setShowEditModal(null);
      alert('مشخصات کالا ویرایش شد.');
  };

  const handleUpdateStock = (e: React.FormEvent) => {
      e.preventDefault();
      if(!showStockModal || !stockForm.quantity) return;
      updateStock(
          showStockModal.item.id, 
          Number(stockForm.quantity), 
          showStockModal.type, 
          stockForm.description, 
          undefined, 
          showStockModal.type === 'IN' ? Number(stockForm.unitPrice) : undefined
      );
      setShowStockModal(null);
      setStockForm({ quantity: '', description: '', unitPrice: '' });
  };

  // Kitchen Functions
  const addIngredient = () => { if (!selectedIngredientId || !ingredientQty) return; const exists = kitchenIngredients.find(i => i.itemId === selectedIngredientId); if (exists) { setKitchenIngredients(prev => prev.map(i => i.itemId === selectedIngredientId ? { ...i, quantity: i.quantity + Number(ingredientQty) } : i)); } else { setKitchenIngredients(prev => [...prev, { itemId: selectedIngredientId, quantity: Number(ingredientQty) }]); } setSelectedIngredientId(''); setIngredientQty(''); };
  const removeIngredient = (id: string) => { setKitchenIngredients(prev => prev.filter(i => i.itemId !== id)); };
  const calculateProduction = () => { const rawWeight = kitchenIngredients.reduce((acc, curr) => acc + curr.quantity, 0); return rawWeight; };
  const handleCook = () => { const rawWeight = calculateProduction(); const finalWeight = rawWeight * (1 - (productionTolerance / 100)); produceFoodBatch(kitchenIngredients, finalWeight); setKitchenIngredients([]); alert(`تولید غذا ثبت شد. ${finalWeight.toFixed(2)} کیلوگرم (با احتساب ${productionTolerance}٪ افت پخت) به موجودی "غذای پخته روزانه" اضافه شد.`); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Package className="text-blue-600"/> مدیریت انبار و آشپزخانه
        </h2>
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border dark:border-gray-700"><button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>لیست کالاها</button><button onClick={() => setActiveTab('kitchen')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'kitchen' ? 'bg-orange-600 text-white' : 'text-gray-500'}`}><ChefHat size={16}/> آشپزخانه و تولید</button></div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          <div className="flex justify-end"><button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20"><Plus size={20}/> تعریف کالای جدید</button></div>
          
          {pendingPurchases.length > 0 && (<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3"><ShoppingCart className="text-blue-600 shrink-0" /><div><h4 className="font-bold text-blue-800 dark:text-blue-200">درخواست‌های خرید فعال</h4><p className="text-sm text-blue-700 dark:text-blue-300">{pendingPurchases.length} مورد کالا (اغلب دارویی) در انتظار خرید هستند.</p></div></div>)}
          {lowStockItems.length > 0 && (<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3"><AlertTriangle className="text-amber-600 shrink-0" /><div><h4 className="font-bold text-amber-800 dark:text-amber-200">هشدار موجودی کم</h4><p className="text-sm text-amber-700 dark:text-amber-300">کالاهای زیر به نقطه سفارش رسیده‌اند: {lowStockItems.map(i => i.name).join('، ')}</p></div></div>)}
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center"><div className="flex-1 w-full relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/><input type="text" placeholder="جستجوی کالا..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" /></div><div className="flex gap-2 w-full md:w-auto overflow-x-auto">{['All', 'Food', 'Medical', 'Equipment', 'Other'].map(cat => (<button key={cat} onClick={() => setCategoryFilter(cat as any)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${categoryFilter === cat ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>{cat === 'All' ? 'همه' : cat === 'Food' ? 'غذایی' : cat === 'Medical' ? 'دارویی' : cat === 'Equipment' ? 'تجهیزات' : 'سایر'}</button>))}</div></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all relative overflow-hidden group">
                      {isAdmin && (
                          <button 
                              onClick={() => setShowEditModal(item)} 
                              className="absolute top-2 left-2 p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="ویرایش کالا"
                          >
                              <Edit2 size={16}/>
                          </button>
                      )}
                      <div className="flex justify-between items-start mb-3"><div className={`p-2 rounded-lg ${item.category === 'Food' ? 'bg-orange-100 text-orange-600' : item.category === 'Medical' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}><Archive size={20}/></div><span className={`text-xs px-2 py-1 rounded-full border ${item.quantity <= item.minQuantity ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{item.quantity <= item.minQuantity ? 'موجودی کم' : 'موجود'}</span></div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-4">{item.category}</p>
                      <div className="flex justify-between items-end mb-4"><div><span className="text-3xl font-bold text-gray-800 dark:text-gray-200">{item.quantity.toFixed(2)}</span><span className="text-sm text-gray-500 mr-1">{item.unit}</span></div><div className="text-right"><p className="text-xs text-gray-400">حداقل: {item.minQuantity}</p><p className="text-[10px] text-gray-400 mt-1">م.قیمت: {new Intl.NumberFormat('fa-IR').format(Math.round(item.averageCost || 0))}</p></div></div>
                      <div className="grid grid-cols-2 gap-2"><button onClick={() => setShowStockModal({ item, type: 'IN' })} className="py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 flex justify-center items-center gap-1"><TrendingUp size={14}/> ورود (خرید)</button><button onClick={() => setShowStockModal({ item, type: 'OUT' })} className="py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 flex justify-center items-center gap-1"><TrendingDown size={14}/> خروج (مصرف)</button></div>
                  </div>
              ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><History size={20}/> آخرین تراکنش‌های انبار</h3><div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead className="bg-gray-50 dark:bg-gray-700 text-gray-500"><tr><th className="p-3">کالا</th><th className="p-3">نوع</th><th className="p-3">تعداد</th><th className="p-3">ارزش (تومان)</th><th className="p-3">کاربر</th><th className="p-3">توضیحات</th><th className="p-3">تاریخ</th></tr></thead><tbody className="divide-y dark:divide-gray-700">{inventoryTransactions.slice(0, 10).map(txn => (<tr key={txn.id}><td className="p-3 font-medium dark:text-white">{txn.itemName}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs ${txn.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{txn.type === 'IN' ? 'ورود' : 'خروج'}</span></td><td className="p-3 dark:text-gray-300">{txn.quantity.toFixed(2)}</td><td className="p-3 font-mono text-xs">{txn.totalPrice ? new Intl.NumberFormat('fa-IR').format(Math.round(txn.totalPrice)) : '-'}</td><td className="p-3 text-gray-500">{txn.userName}</td><td className="p-3 text-gray-500 max-w-xs truncate">{txn.description}</td><td className="p-3 text-gray-400 text-xs font-mono">{txn.date}</td></tr>))}</tbody></table></div></div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kitchen Logic remains unchanged */}
            <div className="lg:col-span-2 space-y-6"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><Utensils size={20}/> محاسبه مواد اولیه</h3><div className="flex flex-wrap gap-2 mb-4 items-end"><div className="flex-1 min-w-[200px]"><label className="block text-xs mb-1 dark:text-gray-300">انتخاب ماده اولیه</label><select className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={selectedIngredientId} onChange={e => setSelectedIngredientId(e.target.value)}><option value="">انتخاب کنید...</option>{foodInventory.map(item => (<option key={item.id} value={item.id}>{item.name} (موجود: {item.quantity} {item.unit})</option>))}</select></div><div className="w-32"><label className="block text-xs mb-1 dark:text-gray-300">مقدار مصرفی</label><input type="number" className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="وزن/تعداد" value={ingredientQty} onChange={e => setIngredientQty(e.target.value)} /></div><button onClick={addIngredient} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Plus size={20}/></button></div><div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl border dark:border-gray-700 overflow-hidden"><table className="w-full text-right text-sm"><thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"><tr><th className="p-3">ماده اولیه</th><th className="p-3">مقدار مصرفی</th><th className="p-3">حذف</th></tr></thead><tbody>{kitchenIngredients.map((ing, idx) => { const item = inventory.find(i => i.id === ing.itemId); return (<tr key={idx} className="border-b dark:border-gray-700 last:border-0"><td className="p-3">{item?.name}</td><td className="p-3">{ing.quantity} {item?.unit}</td><td className="p-3"><button onClick={() => removeIngredient(ing.itemId)} className="text-red-500"><Trash2 size={16}/></button></td></tr>); })}{kitchenIngredients.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400">لیست خالی است</td></tr>}</tbody></table></div></div></div>
            <div className="space-y-6"><div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"><h3 className="font-bold dark:text-white mb-4 flex items-center gap-2"><ChefHat size={20}/> تولید و پخت</h3><div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center border border-orange-100 dark:border-orange-800 mb-6"><p className="text-xs text-orange-600 dark:text-orange-300 mb-1">وزن مواد اولیه (خام)</p><h3 className="text-3xl font-black text-orange-800 dark:text-orange-100">{calculateProduction()} kg</h3></div><div className="flex justify-between text-sm text-gray-500 mb-2"><span>درصد افت پخت (تنظیمات):</span><span>{productionTolerance}%</span></div><div className="flex justify-between text-sm font-bold text-gray-800 dark:text-white mb-4"><span>وزن نهایی تخمینی:</span><span>{(calculateProduction() * (1 - (productionTolerance / 100))).toFixed(2)} kg</span></div><button onClick={handleCook} disabled={kitchenIngredients.length === 0} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 disabled:bg-gray-400 disabled:shadow-none">ثبت تولید و افزایش موجودی</button></div></div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-xl">
                  <h3 className="font-bold mb-4 dark:text-white text-lg">تعریف کالای جدید</h3>
                  <form onSubmit={handleAddItem} className="space-y-4">
                      <div><label className="block text-xs mb-1 dark:text-gray-300">نام کالا</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItemForm.name} onChange={e => setNewItemForm({...newItemForm, name: e.target.value})} /></div>
                      <div><label className="block text-xs mb-1 dark:text-gray-300">دسته‌بندی</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItemForm.category} onChange={e => setNewItemForm({...newItemForm, category: e.target.value as any})}><option value="Food">غذایی</option><option value="Medical">دارویی</option><option value="Equipment">تجهیزات</option><option value="Other">سایر</option></select></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-xs mb-1 dark:text-gray-300">موجودی اولیه</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItemForm.quantity} onChange={e => setNewItemForm({...newItemForm, quantity: Number(e.target.value)})} /></div>
                          <div><label className="block text-xs mb-1 dark:text-gray-300">واحد</label>
                          <select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItemForm.unit} onChange={e => setNewItemForm({...newItemForm, unit: e.target.value})}>
                              <option value="عدد">عدد</option>
                              <option value="بسته">بسته</option>
                              <option value="جعبه">جعبه</option>
                              <option value="کارتن">کارتن</option>
                              <option value="ویال">ویال</option>
                              <option value="آمپول">آمپول</option>
                              <option value="قرص">قرص</option>
                              <option value="میلی‌لیتر">میلی‌لیتر</option>
                              <option value="سی‌سی">سی‌سی</option>
                              <option value="گرم">گرم</option>
                              <option value="کیلوگرم">کیلوگرم</option>
                              <option value="لیتر">لیتر</option>
                          </select>
                          </div>
                      </div>
                      <div><label className="block text-xs mb-1 dark:text-gray-300">نقطه سفارش (حداقل)</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItemForm.minQuantity} onChange={e => setNewItemForm({...newItemForm, minQuantity: Number(e.target.value)})} /></div>
                      <div className="flex gap-2 mt-4">
                          <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-gray-500 border rounded-lg">انصراف</button>
                          <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={18}/> ثبت کالا</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Edit Item Modal (New) */}
      {showEditModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-xl">
                  <h3 className="font-bold mb-4 dark:text-white text-lg flex items-center gap-2"><Edit2 size={20}/> ویرایش کالا</h3>
                  <form onSubmit={handleEditItem} className="space-y-4">
                      <div><label className="block text-xs mb-1 dark:text-gray-300">نام کالا</label><input type="text" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editItemForm.name} onChange={e => setEditItemForm({...editItemForm, name: e.target.value})} /></div>
                      <div><label className="block text-xs mb-1 dark:text-gray-300">دسته‌بندی</label><select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editItemForm.category} onChange={e => setEditItemForm({...editItemForm, category: e.target.value as any})}><option value="Food">غذایی</option><option value="Medical">دارویی</option><option value="Equipment">تجهیزات</option><option value="Other">سایر</option></select></div>
                      <div><label className="block text-xs mb-1 dark:text-gray-300">واحد</label>
                      <select className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editItemForm.unit} onChange={e => setEditItemForm({...editItemForm, unit: e.target.value})}>
                          <option value="عدد">عدد</option>
                          <option value="بسته">بسته</option>
                          <option value="جعبه">جعبه</option>
                          <option value="کارتن">کارتن</option>
                          <option value="ویال">ویال</option>
                          <option value="آمپول">آمپول</option>
                          <option value="قرص">قرص</option>
                          <option value="میلی‌لیتر">میلی‌لیتر</option>
                          <option value="سی‌سی">سی‌سی</option>
                          <option value="گرم">گرم</option>
                          <option value="کیلوگرم">کیلوگرم</option>
                          <option value="لیتر">لیتر</option>
                      </select>
                      </div>
                      <div><label className="block text-xs mb-1 dark:text-gray-300">نقطه سفارش</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={editItemForm.minQuantity} onChange={e => setEditItemForm({...editItemForm, minQuantity: Number(e.target.value)})} /></div>
                      <div className="flex gap-2 mt-4">
                          <button type="button" onClick={() => setShowEditModal(null)} className="flex-1 py-2 text-gray-500 border rounded-lg">انصراف</button>
                          <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">ذخیره تغییرات</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in shadow-xl">
                  <h3 className={`font-bold mb-4 text-lg ${showStockModal.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{showStockModal.type === 'IN' ? 'افزایش موجودی (ورود کالا)' : 'کاهش موجودی (خروج کالا)'}</h3>
                  <p className="text-sm text-gray-500 mb-4">{showStockModal.item.name} (موجودی فعلی: {showStockModal.item.quantity})</p>
                  <form onSubmit={handleUpdateStock} className="space-y-4">
                      <div><label className="block text-xs mb-1 dark:text-gray-300">تعداد / مقدار</label><input type="number" required className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} /></div>
                      {showStockModal.type === 'IN' && (<div><label className="block text-xs mb-1 dark:text-gray-300">قیمت خرید واحد (تومان) - جهت محاسبه میانگین</label><input type="number" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={stockForm.unitPrice} onChange={e => setStockForm({...stockForm, unitPrice: e.target.value})} placeholder={showStockModal.item.averageCost.toString()} /></div>)}
                      <div><label className="block text-xs mb-1 dark:text-gray-300">توضیحات</label><input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={stockForm.description} onChange={e => setStockForm({...stockForm, description: e.target.value})} placeholder={showStockModal.type === 'IN' ? 'خرید فاکتور شماره...' : 'مصرف داخلی...'} /></div>
                      <div className="flex gap-2 mt-4">
                          <button type="button" onClick={() => setShowStockModal(null)} className="flex-1 py-2 text-gray-500 border rounded-lg">انصراف</button>
                          <button type="submit" className={`flex-1 py-2 text-white rounded-lg font-bold ${showStockModal.type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>ثبت</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
