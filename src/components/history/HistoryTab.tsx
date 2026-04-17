import React from 'react';
import { DollarSign, Printer } from 'lucide-react';
import { Transaction, Expense } from '../../types';
import { formatCurrency, formatNumber, parseNumber } from '../../utils/formatters';

interface HistoryTabProps {
  transactions: Transaction[];
  expenses: Expense[];
  pettyCash: number;
  setPettyCash: (value: number) => void;
}

export function HistoryTab({
  transactions,
  expenses,
  pettyCash,
  setPettyCash
}: HistoryTabProps) {
  const totalTunai = transactions.filter(t => t.paymentMethod === 'Tunai').reduce((s,t) => s + t.total, 0);
  const totalQRIS = transactions.filter(t => t.paymentMethod === 'QRIS').reduce((s,t) => s + t.total, 0);
  const totalExpenses = expenses.reduce((s,e) => s + e.amount, 0);
  const saldoAkhir = pettyCash + totalTunai - totalExpenses;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Kasir Hari Ini</span>
          <span className="text-[10px] font-mono opacity-60">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-white/10 pb-3">
            <div>
              <p className="text-[10px] opacity-60 uppercase font-bold mb-1">Modal Awal (Petty Cash)</p>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 text-xs">Rp</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={formatNumber(pettyCash)}
                  onChange={(e) => setPettyCash(Number(parseNumber(e.target.value)))}
                  className="bg-transparent border-none outline-none pl-6 text-xl font-black w-full text-white placeholder:text-white/20"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] opacity-60 uppercase font-bold mb-1">Total Tunai</p>
              <p className="text-md font-black text-emerald-400">+{formatCurrency(totalTunai)}</p>
            </div>
            <div>
              <p className="text-[9px] opacity-60 uppercase font-bold mb-1">Total QRIS</p>
              <p className="text-md font-black text-purple-400">+{formatCurrency(totalQRIS)}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-white/10">
              <p className="text-[10px] opacity-60 uppercase font-bold mb-1">Saldo Akhir Tunai (Modal + Tunai - Pengeluaran)</p>
              <p className="text-2xl font-black text-white">{formatCurrency(saldoAkhir)}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="font-black flex items-center gap-2 uppercase tracking-tight"><DollarSign size={18} className="text-emerald-600"/> Riwayat Transaksi</h2>
      {transactions.length === 0 ? (
        <div className="text-center text-slate-400 py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <Printer size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-sm italic">Belum ada transaksi</p>
        </div>
      ) : (
        transactions.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden uppercase">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest ${t.paymentMethod === 'QRIS' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {t.paymentMethod}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mb-3 bg-slate-50 inline-block px-2 py-1 rounded-lg">
              {new Date(t.timestamp).toLocaleString('id-ID')}
            </div>
            <div className="space-y-2 mb-4">
              {t.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] uppercase font-bold text-slate-600 leading-tight">
                  <span className="flex-1 truncate pr-4">{item.qty}x {item.name}</span>
                  <span className="shrink-0">{formatCurrency(item.qty * item.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-50 font-black">
              <span className="text-xs text-slate-400">GRAND TOTAL:</span>
              <span className="text-lg text-slate-900">{formatCurrency(t.total)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
