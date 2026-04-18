import React from 'react';
import { Transaction } from '../../types';

interface ThermalReceiptProps {
  currentCart: { name: string; qty: number; price: number }[];
  lastTransaction?: Transaction;
  paymentMethod: string;
  cashReceived: number;
}

export function ThermalReceipt({
  currentCart,
  lastTransaction,
  paymentMethod,
  cashReceived
}: ThermalReceiptProps) {
  const items = currentCart.length > 0 ? currentCart : (lastTransaction?.items || []);
  const method = currentCart.length > 0 ? paymentMethod : (lastTransaction?.paymentMethod || '');
  const received = currentCart.length > 0 ? cashReceived : (lastTransaction?.cashReceived || 0);
  const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
  const change = currentCart.length > 0 
    ? (Number(cashReceived) - total) 
    : (lastTransaction?.change || 0);

  return (
    <div className="hidden print:block print-receipt animate-in fade-in">
      <div className="text-center font-black text-[12px] mb-0.5 uppercase tracking-tighter">PSRESTO</div>
      <div className="text-[7px] text-center mb-1 leading-[1.2] opacity-80 uppercase">
        Jl. Raya Utama No. 88<br/>
        Kec. Purwosari, Pasuruan
      </div>
      <div className="print-dashed h-1 border-slate-900"></div>
      
      <div className="flex justify-between text-[7px] mb-0.5 font-mono uppercase">
        <span>{new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID', {hour12:false})}</span>
        <span>ADMIN</span>
      </div>
      <div className="print-dashed h-1 border-slate-900"></div>
      
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="text-[8px] leading-tight">
            <div className="uppercase font-bold truncate">{item.name}</div>
            <div className="flex justify-between font-mono">
              <span>{item.qty} x {new Intl.NumberFormat('id-ID').format(item.price)}</span>
              <span>{new Intl.NumberFormat('id-ID').format(item.qty * item.price)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="print-dashed h-1 border-slate-900 mt-1"></div>
      <div className="flex justify-between font-black text-[9px] py-0.5">
        <span>TOTAL:</span>
        <span>Rp{new Intl.NumberFormat('id-ID').format(total)}</span>
      </div>
      
      <div className="text-[7.5px] mt-1 space-y-0.5 font-mono capitalize">
        <div className="flex justify-between">
          <span>Metode:</span>
          <span>{method}</span>
        </div>
        {method === 'Tunai' && (
          <>
            <div className="flex justify-between">
              <span>Diterima:</span>
              <span>{new Intl.NumberFormat('id-ID').format(Number(received))}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembali:</span>
              <span>{new Intl.NumberFormat('id-ID').format(Number(change))}</span>
            </div>
          </>
        )}
      </div>
      
      <div className="print-dashed h-1 border-slate-900 mt-2"></div>
      <div className="text-center text-[7px] mt-2 italic font-bold leading-[1.2] uppercase tracking-tighter">
        Terima Kasih Atas Pembelian Anda,<br/>
        Kami tunggu kembali kedatangannya
      </div>
      <div className="h-8"></div>
    </div>
  );
}
