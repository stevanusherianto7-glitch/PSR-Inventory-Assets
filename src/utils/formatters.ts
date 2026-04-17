export const formatCurrency = (value: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value).replace('IDR', 'Rp\u00A0');

export const formatNumber = (val: string | number) => {
  if (val === '' || val === undefined) return '';
  const num = val.toString().replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumber = (val: string) => {
  return val.replace(/\./g, '');
};

export const formatAccounting = (value: number) => {
  const numStr = new Intl.NumberFormat('id-ID').format(value);
  return `Rp${numStr.padStart(15, '\u00A0')}`;
};

export const formatQty = (qty: number) => {
  return `${qty.toString().padStart(3, '\u00A0')} unit`;
};
