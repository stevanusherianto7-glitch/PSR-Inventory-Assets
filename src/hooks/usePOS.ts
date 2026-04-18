import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Transaction, Expense, InventoryItem, PaymentMethod } from '../types';

export function usePOS(items: InventoryItem[], setItems: (items: InventoryItem[]) => void) {
  const [pettyCash, setPettyCash] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cart, setCart] = useState<{ id: string; name: string; qty: number; price: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const savedPettyCash = localStorage.getItem('petty-cash');
      const savedTransactions = localStorage.getItem('transactions');
      const savedExpenses = localStorage.getItem('expenses');

      if (savedPettyCash) setPettyCash(Number(savedPettyCash));

      let localTs: Transaction[] = [];
      let localEx: Expense[] = [];
      if (savedTransactions) {
        try { localTs = JSON.parse(savedTransactions); } catch(e) {}
      }
      if (savedExpenses) {
        try { localEx = JSON.parse(savedExpenses); } catch(e) {}
      }

      if (!supabase) {
        if (localTs.length > 0) setTransactions(localTs);
        if (localEx.length > 0) setExpenses(localEx);
        setLoading(false);
        return;
      }

      // 1. Transactions Fetch & Migration
      const { data: remoteTs, error: tError } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
      if (tError) {
        console.error('Fetch error TS, using local cache:', tError);
        if (localTs.length > 0) setTransactions(localTs);
      } else if (remoteTs && remoteTs.length > 0) {
        setTransactions(remoteTs);
      } else if (savedTransactions && localTs.length > 0) {
        // Migration
        try {
          const { data: insertedData, error: migError } = await supabase.from('transactions').insert(localTs).select();
          if (!migError) {
            setTransactions(insertedData || []);
          } else {
            console.error('T-Migration error:', migError);
            setTransactions(localTs);
          }
        } catch (e) { console.error('T-Migration caught error:', e); setTransactions(localTs); }
      }

      // 2. Expenses Fetch & Migration
      const { data: remoteEx, error: eError } = await supabase.from('expenses').select('*').order('timestamp', { ascending: false });
      if (eError) {
        console.error('Fetch error EX, using local cache:', eError);
        if (localEx.length > 0) setExpenses(localEx);
      } else if (remoteEx && remoteEx.length > 0) {
        setExpenses(remoteEx);
      } else if (savedExpenses && localEx.length > 0) {
        // Migration
        try {
          const { data: insertedEx, error: migExError } = await supabase.from('expenses').insert(localEx).select();
          if (!migExError) {
            setExpenses(insertedEx || []);
          } else {
            console.error('E-Migration error:', migExError);
            setExpenses(localEx);
          }
        } catch (e) { console.error('E-Migration caught error:', e); setExpenses(localEx); }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('petty-cash', pettyCash.toString());
  }, [pettyCash]);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { id: item.id, name: item.name, qty: 1, price: item.price }]);
    }
  };

  const removeFromCart = (id: string) => {
    const existing = cart.find(i => i.id === id);
    if (existing && existing.qty > 1) {
      setCart(cart.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i));
    } else {
      setCart(cart.filter(i => i.id !== id));
    }
  };

  const checkout = async (paymentMethod: PaymentMethod, cashReceived: number) => {
    const total = cart.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const change = paymentMethod === 'Tunai' ? (cashReceived - total) : 0;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      items: [...cart],
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'Tunai' ? cashReceived : undefined,
      change: paymentMethod === 'Tunai' ? change : undefined
    };

    if (supabase) {
      const { error } = await supabase.from('transactions').insert([newTransaction]);
      if (error) {
        console.error('Checkout sync error:', error);
        // Fallback to local if needed, but we prefer real-time sync now
      }
    }

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update inventory stock
    const updatedItems = items.map(item => {
      const sold = cart.find(c => c.id === item.id);
      return sold ? { ...item, quantity: Math.max(0, item.quantity - sold.qty) } : item;
    });

    // Sync stock update to Supabase
    if (supabase) {
      for (const item of cart) {
        const dbItem = updatedItems.find(i => i.id === item.id);
        if (dbItem) {
          await supabase.from('items').update({ quantity: dbItem.quantity }).eq('id', dbItem.id);
        }
      }
    }

    setItems(updatedItems);
    setCart([]);
    return true;
  };

  const addExpense = async (name: string, amount: number) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      name,
      amount,
      timestamp: new Date()
    };

    if (supabase) {
      const { error } = await supabase.from('expenses').insert([newExpense]);
      if (error) console.error('Expense sync error:', error);
    }

    setExpenses(prev => [newExpense, ...prev]);
  };

  return {
    pettyCash,
    setPettyCash,
    transactions,
    expenses,
    cart,
    addToCart,
    removeFromCart,
    checkout,
    addExpense,
    loading
  };
}
