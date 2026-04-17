import React, { useState } from 'react';
import { Minus, Check } from 'lucide-react';
import { Expense } from '../../types';
import { formatCurrency, formatNumber, parseNumber } from '../../utils/formatters';

interface ExpensesTabProps {
  expenses: Expense[];
  addExpense: (name: string, amount: number) => void;
  onSuccess: () => void;
}

export function ExpensesTab({
  expenses,
  addExpense,
  onSuccess
}: ExpensesTabProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  const handleAdd = () => {
    if (name && amount !== '') {
      addExpense(name.toUpperCase(), Number(amount));
      setName('');
      setAmount('');
      onSuccess();
    }
  };

  return (
    <div className="p-4 space-y-5">
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="font-black flex items-center gap-2 uppercase tracking-tight"><Minus size={18} className="text-rose-600"/> Catat Pengeluaran</h2>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="NAMA PENGELUARAN" 
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 uppercase font-black text-sm tracking-wide" 
          />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
            <input 
              type="text" 
              inputMode="numeric"
              placeholder="JUMLAH KELUAR" 
              value={formatNumber(amount)}
              onChange={(e) => setAmount(Number(parseNumber(e.target.value)))}
              className="w-full p-4 pl-12 bg-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 text-lg font-black text-rose-600"
            />
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="w-full bg-rose-600 text-white p-4 rounded-2xl font-black text-sm shadow-[0_8px_15px_-5px_rgba(225,29,72,0.4)] active:scale-95 transition-all uppercase tracking-widest"
        >
          SIMPAN PENGELUARAN
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="font-black text-xs px-2 uppercase text-slate-400 tracking-widest">Daftar Pengeluaran</h2>
        {expenses.length === 0 ? (
          <p className="text-center text-slate-300 py-10 italic text-xs">Belum ada pengeluaran</p>
        ) : (
          expenses.map(e => (
            <div key={e.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group transition-all hover:border-rose-200">
              <div>
                <h3 className="font-black text-[11px] uppercase text-slate-800 tracking-wide leading-tight mb-1">{e.name}</h3>
                <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">{new Date(e.timestamp).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</p>
              </div>
              <div className="text-rose-600 font-black text-sm bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                -{formatCurrency(e.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
