import React, { useState, useEffect } from 'react';
import { FileDown, Printer, Check } from 'lucide-react';
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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Splash show={showSplash} />
      
      <PWAInstallBar 
        showInstallBtn={showInstallBtn}
        setShowInstallBtn={setShowInstallBtn}
        showInstallGuide={showInstallGuide}
        setShowInstallGuide={setShowInstallGuide}
        onInstall={handleInstallClick}
      />

      <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-slate-200">
        <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100">
          {(['Inventory', 'POS', 'History', 'Expenses'] as const).map((v) => (
            <button 
              key={v} 
              onClick={() => setActiveView(v)} 
              className={`flex-1 p-4 font-bold whitespace-nowrap text-sm ${activeView === v ? 'bg-slate-100 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
            >
              {v}
            </button>
          ))}
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

      <ThermalReceipt 
        currentCart={[]} 
        lastTransaction={transactions[0]}
        paymentMethod=""
        cashReceived={0}
      />

      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Check size={20} />
            <span className="font-semibold">Berhasil!</span>
          </div>
        </div>
      )}
    </div>
  );
}
