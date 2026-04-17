import React, { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';
import { InventoryItem, PaymentMethod } from '../../types';
import { formatCurrency, formatNumber, parseNumber } from '../../utils/formatters';

interface POSTabProps {
  items: InventoryItem[];
  cart: { id: string; name: string; qty: number; price: number }[];
  addToCart: (item: InventoryItem) => void;
  removeFromCart: (id: string) => void;
  checkout: (paymentMethod: PaymentMethod, cashReceived: number) => boolean;
  onSuccess: () => void;
}

export function POSTab({
  items,
  cart,
  addToCart,
  removeFromCart,
  checkout,
  onSuccess
}: POSTabProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [cashReceived, setCashReceived] = useState<number | ''>('');

  const handleCheckout = () => {
    const total = cart.reduce((sum, item) => sum + (item.qty * item.price), 0);
    if (paymentMethod === 'Tunai' && (Number(cashReceived) < total)) {
      alert('Uang diterima kurang!');
      return;
    }

    const success = checkout(paymentMethod, Number(cashReceived));
    if (success) {
      setCashReceived('');
      onSuccess();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 uppercase">
        <h2 className="font-black mb-3 flex items-center gap-2"><Package size={18} className="text-blue-600"/> Daftar Menu</h2>
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 uppercase">
          {items.length === 0 ? (
            <p className="col-span-2 text-center text-slate-400 text-xs py-4 italic">Belum ada menu di Inventaris</p>
          ) : (
            items.map(item => (
              <button 
                key={item.id} 
                onClick={() => addToCart(item)}
                className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left active:bg-blue-50 transition-colors"
                disabled={item.quantity <= 0}
              >
                <div className="font-black text-[10px] truncate leading-tight mb-1">{item.name}</div>
                <div className="text-[11px] text-blue-600 font-black">{formatCurrency(item.price)}</div>
                <div className="text-[9px] text-slate-400 font-medium">STOK: {item.quantity}</div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="font-black mb-3 flex items-center gap-2 text-rose-600 uppercase"><Plus size={18}/> Keranjang</h2>
        {cart.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-10 border border-dashed rounded-xl italic">Keranjang kosong</p>
        ) : (
          <div className="space-y-3 mb-4">
            {cart.map(c => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <div className="flex-1 truncate uppercase pr-2 font-bold text-slate-700">{c.name}</div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
                  <button 
                    onClick={() => removeFromCart(c.id)} 
                    className="text-slate-500 hover:text-rose-500"
                    aria-label="Kurangi Jumlah"
                  >
                    <Minus size={14}/>
                  </button>
                  <span className="font-black min-w-[24px] text-center">{c.qty}</span>
                  <button 
                    onClick={() => addToCart(items.find(i => i.id === c.id)!)} 
                    className="text-slate-500 hover:text-emerald-500"
                    aria-label="Tambah Jumlah"
                  >
                    <Plus size={14}/>
                  </button>
                </div>
                <div className="w-[85px] text-right font-black text-slate-900 ml-2">{formatCurrency(c.qty * c.price)}</div>
              </div>
            ))}
            <div className="pt-3 border-t-2 border-dashed mt-3 flex justify-between items-center bg-slate-50 p-3 rounded-xl border-slate-200">
              <span className="font-black text-sm text-slate-500">TOTAL:</span>
              <span className="font-black text-rose-600 text-xl">{formatCurrency(cart.reduce((s, i) => s + (i.qty * i.price), 0))}</span>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              {(['Tunai', 'QRIS'] as const).map(m => (
                <button 
                  key={m} 
                  onClick={() => setPaymentMethod(m)} 
                  className={`flex-1 py-3 rounded-xl font-black text-[11px] transition-all uppercase tracking-wider ${paymentMethod === m ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod === 'Tunai' && (
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="JUMLAH DITERIMA" 
                  value={formatNumber(cashReceived)} 
                  onChange={(e) => setCashReceived(Number(parseNumber(e.target.value)))}
                  className="w-full p-4 pl-12 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-lg font-black"
                />
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={paymentMethod === 'Tunai' && !cashReceived}
              className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black text-lg shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none uppercase tracking-widest"
            >
              BAYAR & CETAK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
