import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem } from '../types';
import { formatCurrency, formatAccounting, formatQty } from './formatters';

export const savePDF = (items: InventoryItem[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFontSize(18);
  doc.text('Laporan Inventaris Kitchen Asset dan Mini Bar Asset', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

  const renderTable = (category: 'Kitchen' | 'Mini Bar', startY: number) => {
    const categoryItems = items.filter(item => item.category === category);
    const totalItemsCat = categoryItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalValueCat = categoryItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);

    doc.setFontSize(14);
    doc.text(`${category} Asset`, 14, startY);
    doc.setFontSize(9);
    doc.text(`Total Jenis Item: ${categoryItems.length} | Total Item: ${totalItemsCat} unit | Total Aset: ${formatCurrency(totalValueCat)}`, 14, startY + 6);

    const tableData = categoryItems.map((item, index) => [
      index + 1,
      item.name,
      formatQty(item.quantity),
      formatAccounting(item.price),
      formatAccounting(item.quantity * item.price)
    ]);

    autoTable(doc, {
      startY: startY + 10,
      head: [['No', 'Nama Item', 'Qty', 'Harga Satuan', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], halign: 'center' },
      styles: { fontSize: 8, textColor: [0, 0, 0], font: 'courier' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', font: 'helvetica' }, 
        2: { halign: 'right', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 45 },
        4: { halign: 'right', cellWidth: 45 }
      },
      didDrawPage: (data) => {
        const str = 'Inventory Asset Pawon Salam Resto';
        const pageCount = (doc as any).internal.getNumberOfPages();
        const pageCurrent = (doc as any).internal.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
        
        const pageText = `Halaman ${pageCurrent} dari ${pageCount}`;
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(pageText, doc.internal.pageSize.width - data.settings.margin.right - 25, pageHeight - 10);
      }
    });
    return (doc as any).lastAutoTable.finalY;
  };

  const nextY = renderTable('Kitchen', 40);
  renderTable('Mini Bar', nextY + 15);

  doc.save('laporan-inventaris-lengkap.pdf');
};
