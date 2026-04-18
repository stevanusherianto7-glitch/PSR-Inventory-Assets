import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Minus, Package, DollarSign, Pencil, Check, Search, Table } from 'lucide-react';
import { InventoryItem, CategoryType } from '../../types';
import { formatCurrency, formatNumber, parseNumber } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelGenerator';

interface InventoryTabProps {
  items: InventoryItem[];
  activeTab: CategoryType;
  setActiveTab: (tab: CategoryType) => void;
  addItem: (name: string, category: CategoryType, quantity: number, price: number) => Promise<boolean>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  saveEdit: (id: string, name: string, price: number) => Promise<boolean>;
  onSuccess?: (msg?: string) => void;
}

export function InventoryTab({
  items,
  activeTab,
  setActiveTab,
  addItem,
  updateQuantity,
  deleteItem,
  saveEdit,
  onSuccess
}: InventoryTabProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() =>
    items.filter(item =>
      item.category === activeTab &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [items, activeTab, searchTerm]
  );

  // Summary stats — computed at component level (Rules of Hooks compliant)
  const totalSku = useMemo(() => filteredItems.length, [filteredItems]);
  const totalQty = useMemo(() => filteredItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [filteredItems]);
  const totalValue = useMemo(() => filteredItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0), [filteredItems]);

  const handleExport = () => {
    const exportData = filteredItems.map(item => ({
      'Nama Item': item.name,
      'Kategori': item.category,
      'Stok': item.quantity,
      'Harga Satuan': item.price,
      'Total Nilai': item.quantity * item.price
    }));
    exportToExcel(exportData, `Inventaris_${activeTab}_${new Date().toISOString().split('T')[0]}`);
  };

  const handleAdd = async () => {
    if (!name || price === '' || price <= 0) return;
    // Apply uppercase at save time, not during typing
    const success = await addItem(name.toUpperCase(), activeTab, quantity, Number(price));
    if (success) {
      setName('');
      setQuantity(1);
      setPrice('');
      if (onSuccess) onSuccess('Tersimpan');
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName || editPrice === '' || editPrice < 0) return;
    // Apply uppercase at save time, not during typing
    const success = await saveEdit(id, editName.toUpperCase(), Number(editPrice));
    if (success) {
      setEditingId(null);
      if (onSuccess) onSuccess('Tersimpan');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex">
        <button onClick={() => setActiveTab('Kitchen')} className={`flex-1 p-3 font-bold text-xs ${activeTab === 'Kitchen' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Kitchen Asset</button>
        <button onClick={() => setActiveTab('Mini Bar')} className={`flex-1 p-3 font-bold text-xs ${activeTab === 'Mini Bar' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Mini Bar Asset</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 mb-1 opacity-80">
            <Package size={18} />
            <span className="text-sm font-medium">Total Items</span>
          </div>
          <div className="text-3xl font-bold">{totalSku}</div>
          <div className="text-[10px] opacity-70 mt-1">({totalQty} unit)</div>
        </div>
        <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 mb-1 opacity-80">
            <DollarSign size={18} />
            <span className="text-sm font-medium">Total Value</span>
          </div>
          <div className="text-xl font-bold truncate">{formatCurrency(totalValue)}</div>
          <div className="text-[10px] opacity-70 mt-1">Estimasi Nilai Aset</div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari Asset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <button
          onClick={handleExport}
          className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          title="Export to Excel"
          aria-label="Export to Excel"
        >
          <Table size={20} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-3">
        <input
          type="text"
          placeholder="NAMA ITEM (Ketik 30 CM bisa)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-uppercase w-full p-3 bg-slate-100 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold dark:text-slate-100 dark:placeholder-slate-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
          />
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Price"
              value={formatNumber(price)}
              onChange={(e) => {
                const raw = parseNumber(e.target.value);
                setPrice(raw === '' ? '' : Number(raw));
              }}
              className="w-full p-3 pl-10 bg-slate-100 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            />
          </div>
        </div>
        <button onClick={handleAdd} className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="space-y-2">
        {filteredItems.length === 0 && searchTerm ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600 italic text-sm">
            Tidak ada aset yang cocok dengan "{searchTerm}"
          </div>
        ) : null}
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              {editingId === item.id ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-uppercase font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-900 p-1 rounded text-sm w-full outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Nama Item"
                  />
                  <div className="relative flex items-center">
                    <span className="absolute left-1 text-[10px] text-slate-400">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumber(editPrice)}
                      onChange={(e) => {
                        const raw = parseNumber(e.target.value);
                        setEditPrice(raw === '' ? '' : Number(raw));
                      }}
                      className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-1 pl-5 rounded w-full outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Harga"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{item.name}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatCurrency(item.price)} / unit</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-full p-1 border border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
                  aria-label="Kurangi Jumlah"
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold text-xs w-6 text-center dark:text-slate-100">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors"
                  aria-label="Tambah Jumlah"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                {editingId === item.id ? (
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors"
                    aria-label="Simpan Edit"
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                    aria-label="Edit Item"
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  onClick={async () => {
                    await deleteItem(item.id);
                    if (onSuccess) onSuccess('Dihapus');
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors"
                  aria-label="Hapus Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
