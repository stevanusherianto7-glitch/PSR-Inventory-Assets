import { DollarSign, Printer, Table } from 'lucide-react';
import { Transaction, Expense } from '../../types';
import { formatCurrency, formatNumber, parseNumber } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelGenerator';

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
  const handleExport = () => {
    const exportData = transactions.map(t => ({
      'ID Transaksi': t.id,
      'Waktu': new Date(t.timestamp).toLocaleString('id-ID'),
      'Metode': t.paymentMethod,
      'Total': t.total,
      'Diterima': t.cashReceived || 0,
      'Kembali': t.change || 0,
      'Items': t.items.map(i => `${i.qty}x ${i.name}`).join(', ')
    }));
    exportToExcel(exportData, `Transaksi_${new Date().toISOString().split('T')[0]}`);
  };

  const totalTunai = transactions.filter(t => t.paymentMethod === 'Tunai').reduce((s,t) => s + t.total, 0);
  const totalQRIS = transactions.filter(t => t.paymentMethod === 'QRIS').reduce((s,t) => s + t.total, 0);
  const totalExpenses = expenses.reduce((s,e) => s + e.amount, 0);
  const saldoAkhir = pettyCash + totalTunai - totalExpenses;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-slate-900 dark:bg-black text-white p-5 rounded-3xl shadow-xl border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Kasir Hari Ini</span>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-wider"
          >
            <Table size={12} /> EXPORT
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-white/10 pb-3">
            <div>
              <p className="text-[10px] opacity-60 uppercase font-bold mb-1">Modal Awal (Petty Cash)</p>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 text-xs text-slate-300">Rp</span>
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
              <p className="text-[10px] opacity-60 uppercase font-bold mb-1 text-slate-300">Saldo Akhir Tunai (Modal + Tunai - Pengeluaran)</p>
              <p className="text-2xl font-black text-white">{formatCurrency(saldoAkhir)}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="font-black flex items-center gap-2 uppercase tracking-tight dark:text-slate-100"><DollarSign size={18} className="text-emerald-600"/> Riwayat Transaksi</h2>
      {transactions.length === 0 ? (
        <div className="text-center text-slate-400 py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-700">
          <Printer size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-sm italic">Belum ada transaksi</p>
        </div>
      ) : (
        transactions.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden uppercase">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest ${t.paymentMethod === 'QRIS' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {t.paymentMethod}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mb-3 bg-slate-50 dark:bg-slate-900 inline-block px-2 py-1 rounded-lg">
              {new Date(t.timestamp).toLocaleString('id-ID')}
            </div>
            <div className="space-y-2 mb-4">
              {t.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] uppercase font-bold text-slate-600 dark:text-slate-400 leading-tight">
                  <span className="flex-1 truncate pr-4">{item.qty}x {item.name}</span>
                  <span className="shrink-0">{formatCurrency(item.qty * item.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-50 dark:border-slate-900 font-black">
              <span className="text-xs text-slate-400 dark:text-slate-500">GRAND TOTAL:</span>
              <span className="text-lg text-slate-900 dark:text-slate-100">{formatCurrency(t.total)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
