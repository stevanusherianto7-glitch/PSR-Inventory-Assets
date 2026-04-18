import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { InventoryItem, CategoryType } from '../types';
import { initialItems } from '../constants/initialItems';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const savedItems = localStorage.getItem('kitchen-inventory');

      if (!supabase) {
        if (savedItems) {
          try {
            setItems(JSON.parse(savedItems));
          } catch (e) {
            setItems(initialItems);
          }
        } else {
          setItems(initialItems);
        }
        setLoading(false);
        return;
      }

      // Supabase is configured, try fetching
      const { data, error } = await supabase.from('items').select('*');
      
      if (error) {
        console.error('Error fetching items from Supabase:', error);
        setItems(initialItems);
      } else if (data && data.length > 0) {
        setItems(data);
      } else if (savedItems) {
        // Migration logic
        try {
          const parsed = JSON.parse(savedItems);
          const { data: insertedData, error: insertError } = await supabase.from('items').insert(
            parsed.map((item: any) => ({
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              price: item.price
            }))
          ).select();

          if (insertError) {
            console.error('Migration error:', insertError);
            setItems(parsed);
          } else {
            setItems(insertedData || []);
            localStorage.removeItem('kitchen-inventory');
          }
        } catch (e) {
          setItems(initialItems);
        }
      } else {
        setItems(initialItems);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Only persist to localStorage when Supabase is NOT configured (offline-first mode)
  useEffect(() => {
    if (!supabase && items.length > 0) {
      localStorage.setItem('kitchen-inventory', JSON.stringify(items));
    }
  }, [items]);

  const addItem = async (name: string, category: CategoryType, quantity: number, price: number) => {
    const newItem = { name, category, quantity, price };
    
    if (!supabase) {
      const tempId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 11);
      setItems(prev => [...prev, { ...newItem, id: tempId }]);
      return true;
    }

    const { data, error } = await supabase.from('items').insert([newItem]).select();
    if (error) {
      console.error('Error adding item:', error);
      return false;
    } else if (data) {
      setItems(prev => [...prev, data[0]]);
      return true;
    }
    return false;
  };

  const updateQuantity = async (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return false;
    const newQuantity = Math.max(0, Number(item.quantity || 0) + delta);
    
    if (!supabase) {
      setItems(items.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
      return true;
    }
    const { error } = await supabase.from('items').update({ quantity: newQuantity }).eq('id', id);
    if (error) {
      console.error('Error updating quantity:', error);
      return false;
    } else {
      setItems(items.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
      return true;
    }
  };

  const deleteItem = async (id: string) => {
    if (!supabase) {
      setItems(items.filter(item => item.id !== id));
      return true;
    }
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      console.error('Error deleting item:', error);
      return false;
    } else {
      setItems(items.filter(item => item.id !== id));
      return true;
    }
  };

  const saveEdit = async (id: string, name: string, price: number) => {
    if (!supabase) {
      setItems(items.map(item => item.id === id ? { ...item, name, price } : item));
      return true;
    }
    const { error } = await supabase.from('items').update({ name, price }).eq('id', id);
    if (error) {
      console.error('Error updating item:', error);
      return false;
    } else {
      setItems(items.map(item => item.id === id ? { ...item, name, price } : item));
      return true;
    }
  };

  return {
    items,
    setItems,
    loading,
    addItem,
    updateQuantity,
    deleteItem,
    saveEdit
  };
}
