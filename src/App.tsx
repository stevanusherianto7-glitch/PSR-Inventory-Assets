import React, { useState, useEffect } from 'react';
import { FileDown, Printer, Check, Moon, Sun } from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import { usePOS } from './hooks/usePOS';
import { usePWA } from './hooks/usePWA';
import { savePDF } from './utils/pdfGenerator';
import { ViewType, CategoryType } from './types';

// Components
import { Splash } from './components/shared/Splash';
import { PWAInstallBar } from './components/shared/PWAInstallBar';
import { InventoryTab } from './components/inventory/InventoryTab';
import { POSTab } from './components/pos/POSTab';
import { HistoryTab } from './components/history/HistoryTab';
import { ExpensesTab } from './components/expenses/ExpensesTab';
import { ThermalReceipt } from './components/reporting/ThermalReceipt';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('Inventory');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Kitchen');
  const [showSplash, setShowSplash] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Dynamic Theme Color for Android/Safari
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', isDark ? '#010409' : '#ffffff');
  }, [isDark]);

  const {
    items,
    setItems,
    addItem,
    updateQuantity,
    deleteItem,
    saveEdit
  } = useInventory();

  const {
    pettyCash,
    setPettyCash,
    transactions,
    expenses,
    cart,
    addToCart,
    removeFromCart,
    checkout,
    addExpense
  } = usePOS(items, setItems);

  const {
    showInstallBtn,
    setShowInstallBtn,
    showInstallGuide,
    setShowInstallGuide,
    handleInstallClick
  } = usePWA();

  const [toastMessage, setToastMessage] = useState('Berhasil!');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (msg: string = 'Berhasil!', type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20 transition-colors duration-300">
      <Splash show={showSplash} />
      
      <PWAInstallBar 
        showInstallBtn={showInstallBtn}
        setShowInstallBtn={setShowInstallBtn}
        showInstallGuide={showInstallGuide}
        setShowInstallGuide={setShowInstallGuide}
        onInstall={handleInstallClick}
      />

      <header id="header" className="sticky top-0 z-10 bg-white dark:bg-slate-800 shadow-md border-b border-slate-200 dark:border-slate-700">
        {/* Branding Section for PDF & UI */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-50 dark:border-slate-700/50">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <Printer size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">
              PS<span className="text-blue-600 dark:text-blue-400">Resto</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Manager</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex-1 flex overflow-x-auto no-scrollbar">
            {(['Inventory', 'POS', 'History', 'Expenses'] as const).map((v) => (
              <button 
                key={v} 
                onClick={() => setActiveView(v)} 
                className={`px-5 py-4 font-bold whitespace-nowrap text-sm transition-all ${activeView === v ? 'bg-slate-50/50 dark:bg-slate-900/50 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-4 text-slate-500 dark:text-yellow-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main>
        {activeView === 'Inventory' && (
          <InventoryTab 
            items={items}
            activeTab={activeCategory}
            setActiveTab={setActiveCategory}
            addItem={addItem}
            updateQuantity={updateQuantity}
            deleteItem={deleteItem}
            saveEdit={saveEdit}
            onSuccess={triggerToast}
          />
        )}

        {activeView === 'POS' && (
          <POSTab 
            items={items}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            checkout={checkout}
            onSuccess={triggerToast}
          />
        )}

        {activeView === 'History' && (
          <HistoryTab 
            transactions={transactions}
            expenses={expenses}
            pettyCash={pettyCash}
            setPettyCash={setPettyCash}
          />
        )}

        {activeView === 'Expenses' && (
          <ExpensesTab 
            expenses={expenses}
            addExpense={addExpense}
            onSuccess={triggerToast}
          />
        )}
      </main>

      {activeView !== 'POS' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-3 flex gap-2 z-20">
          <button 
            onClick={() => savePDF(items)} 
            className="flex-1 bg-slate-900 text-white p-3.5 rounded-2xl font-black text-[11px] flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-95 shadow-lg uppercase tracking-widest"
          >
            <FileDown size={18} /> LAPORAN LENGKAP
          </button>
          {activeView === 'Inventory' && (
             <button 
               onClick={() => window.print()} 
               className="bg-slate-100 text-slate-600 p-3.5 rounded-2xl font-black border border-slate-200 active:scale-95 transition-all"
               aria-label="Cetak Inventaris"
             >
                <Printer size={20} />
             </button>
          )}
        </div>
      )}

      {transactions.length > 0 && (
        <ThermalReceipt
          currentCart={[]}
          lastTransaction={transactions[0]}
          paymentMethod={transactions[0]?.paymentMethod ?? 'Tunai'}
          cashReceived={transactions[0]?.cashReceived ?? 0}
        />
      )}

      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`${toastType === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2`}>
            {toastType === 'success' ? <Check size={20} /> : <span className="font-bold">X</span>}
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
