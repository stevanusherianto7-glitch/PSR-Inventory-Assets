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

      if (!supabase) {
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        setLoading(false);
        return;
      }

      // 1. Transactions Fetch & Migration
      const { data: remoteTs, error: tError } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
      if (!tError && remoteTs && remoteTs.length > 0) {
        setTransactions(remoteTs);
      } else if (savedTransactions) {
        // Migration
        try {
          const parsed = JSON.parse(savedTransactions);
          const { data: insertedData, error: migError } = await supabase.from('transactions').insert(parsed).select();
          if (!migError) {
            setTransactions(insertedData || []);
            localStorage.removeItem('transactions');
          } else {
            setTransactions(parsed);
          }
        } catch (e) { console.error('T-Migration error:', e); }
      }

      // 2. Expenses Fetch & Migration
      const { data: remoteEx, error: eError } = await supabase.from('expenses').select('*').order('timestamp', { ascending: false });
      if (!eError && remoteEx && remoteEx.length > 0) {
        setExpenses(remoteEx);
      } else if (savedExpenses) {
        // Migration
        try {
          const parsed = JSON.parse(savedExpenses);
          const { data: insertedEx, error: migExError } = await supabase.from('expenses').insert(parsed).select();
          if (!migExError) {
            setExpenses(insertedEx || []);
            localStorage.removeItem('expenses');
          } else {
            setExpenses(parsed);
          }
        } catch (e) { console.error('E-Migration error:', e); }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('petty-cash', pettyCash.toString());
  }, [pettyCash]);

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
      id: Math.random().toString(36).substring(2, 11),
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
      id: Math.random().toString(36).substring(2, 11),
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
    setCart,
    addToCart,
    removeFromCart,
    checkout,
    addExpense,
    loading
  };
}
