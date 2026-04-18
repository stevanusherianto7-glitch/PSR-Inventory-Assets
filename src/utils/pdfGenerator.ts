import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem } from '../types';
import { formatCurrency, formatAccounting, formatQty } from './formatters';

// ─── Unified Font Model ────────────────────────────────────────────────────
// Seluruh dokumen menggunakan keluarga font yang sama: helvetica
// Variasi hanya pada weight (bold/normal) dan ukuran, bukan keluarga font.
const FONT_FAMILY = 'helvetica';

export const savePDF = (items: InventoryItem[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  // ── Header Dokumen ────────────────────────────────────────────────────────
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Laporan Inventaris Aset Restoran', 14, 20);

  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`PSResto  ·  Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 27);

  // Garis pemisah header
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 31, 196, 31);

  // ── Render Tabel per Kategori ─────────────────────────────────────────────
  const renderTable = (category: 'Kitchen' | 'Mini Bar', startY: number) => {
    const categoryItems = items.filter(item => item.category === category);

    if (categoryItems.length === 0) return startY;

    const totalItemsCat = categoryItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalValueCat = categoryItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);

    // Label kategori
    doc.setFont(FONT_FAMILY, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${category} Asset`, 14, startY);

    // Sub-info kategori
    doc.setFont(FONT_FAMILY, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${categoryItems.length} jenis item  ·  ${totalItemsCat} unit  ·  Total Nilai: ${formatCurrency(totalValueCat)}`,
      14,
      startY + 6
    );

    const tableData = categoryItems.map((item, index) => [
      index + 1,
      item.name,
      formatQty(item.quantity),
      formatAccounting(item.price),
      formatAccounting(item.quantity * item.price),
    ]);

    autoTable(doc, {
      startY: startY + 10,
      head: [['No', 'Nama Item', 'Qty', 'Harga Satuan', 'Subtotal']],
      body: tableData,
      theme: 'grid',

      // ── Unified font: semua sel pakai helvetica ──
      styles: {
        font: FONT_FAMILY,
        fontStyle: 'normal',
        fontSize: 8,
        textColor: [15, 23, 42],
        cellPadding: 3,
      },
      headStyles: {
        font: FONT_FAMILY,
        fontStyle: 'bold',
        fontSize: 8,
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left',   font: FONT_FAMILY, fontStyle: 'normal' },
        2: { halign: 'right',  cellWidth: 22 },
        3: { halign: 'right',  cellWidth: 47 },
        4: { halign: 'right',  cellWidth: 47 },
      },

      // ── Baris ringkasan total di bawah tabel ──
      foot: [[
        '',
        'TOTAL',
        `${totalItemsCat} unit`,
        '',
        formatAccounting(totalValueCat),
      ]],
      footStyles: {
        font: FONT_FAMILY,
        fontStyle: 'bold',
        fontSize: 8,
        fillColor: [241, 245, 249], // slate-100
        textColor: [15, 23, 42],
        halign: 'right',
      },

      // ── Footer halaman ──
      didDrawPage: (data) => {
        const pageCurrent = (doc as any).internal.getCurrentPageInfo().pageNumber;
        const pageCount   = (doc as any).internal.getNumberOfPages();
        const pageH       = doc.internal.pageSize.getHeight();
        const marginLeft  = data.settings.margin.left;
        const marginRight = data.settings.margin.right;

        // Garis footer
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, pageH - 14, doc.internal.pageSize.getWidth() - marginRight, pageH - 14);

        // Teks kiri footer
        doc.setFont(FONT_FAMILY, 'italic');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('PSResto - Asset Management System', marginLeft, pageH - 9);

        // Teks kanan footer (nomor halaman)
        doc.setFont(FONT_FAMILY, 'normal');
        const pageLabel = `Halaman ${pageCurrent} dari ${pageCount}`;
        const labelWidth = doc.getStringUnitWidth(pageLabel) * 7 / doc.internal.scaleFactor;
        doc.text(pageLabel, doc.internal.pageSize.getWidth() - marginRight - labelWidth, pageH - 9);
      },
    });

    return (doc as any).lastAutoTable.finalY;
  };

  // ── Render kedua kategori ─────────────────────────────────────────────────
  const kitchenEndY   = renderTable('Kitchen',  40);
  renderTable('Mini Bar', kitchenEndY + 18);

  // Menggunakan Blob API untuk kompatibilitas lebih baik di Android PWA
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `Laporan_Aset_Resto_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(blobUrl), 150);
};
