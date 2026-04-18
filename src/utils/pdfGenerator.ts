import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InventoryItem } from '../types';
import { formatCurrency, formatAccounting, formatQty } from './formatters';

const FONT = 'helvetica';

// ─── UI Loading Feedback ───────────────────────────────────────────────────
const showLoadingOverlay = () => {
  const overlayId = 'pdf-loading-overlay';
  let overlay = document.getElementById(overlayId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = overlayId;
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: '10000', fontFamily: 'sans-serif'
    });
    overlay.innerHTML = `
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      <h2 style="font-size: 20px; font-weight: bold; margin-top: 20px;">MENYUSUN LAPORAN...</h2>
      <p style="font-size: 14px; margin-top: 8px; color: #cbd5e1;">Mohon tunggu sebentar</p>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
};

const hideLoadingOverlay = (overlay: HTMLElement | null) => {
  if (overlay && document.body.contains(overlay)) {
    document.body.removeChild(overlay);
  }
};

// ─── Pure jsPDF Header (No html2canvas dependency) ────────────────────────
const drawPDFHeader = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Blue accent bar at top
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 4, 'F');
  
  // Logo placeholder (blue rounded box)
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(14, 10, 12, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont(FONT, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PS', 17, 16);
  doc.text('R', 18, 20);
  
  // Title
  doc.setFontSize(16);
  doc.setFont(FONT, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PSResto', 30, 16);
  
  // Subtitle
  doc.setFontSize(8);
  doc.setFont(FONT, 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ASSET MANAGER', 30, 21);
  
  // Report title
  doc.setFontSize(12);
  doc.setFont(FONT, 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN INVENTARIS ASET', pageWidth / 2, 32, { align: 'center' });
  
  // Date
  doc.setFontSize(8);
  doc.setFont(FONT, 'normal');
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  doc.text(dateStr, pageWidth / 2, 37, { align: 'center' });
  
  // Separator line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 40, pageWidth - 14, 40);
  
  return 45; // Return the Y position to start content
};

// ─── Footer ───────────────────────────────────────────────────────────────
const drawFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
  
  doc.setFontSize(7);
  doc.setFont(FONT, 'normal');
  doc.setTextColor(148, 163, 184);
  
  const footerY = pageHeight - 10;
  const timestamp = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
  const pageLabel = `Halaman ${currentPage}`;
  
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);
  doc.text(timestamp, 14, footerY);
  doc.text('PSResto - Asset Management', pageWidth / 2, footerY, { align: 'center' });
  doc.text(pageLabel, pageWidth - 14 - doc.getTextWidth(pageLabel), footerY);
};

export const savePDF = async (items: InventoryItem[]) => {
  const overlay = showLoadingOverlay();
  
  try {
    const doc = new jsPDF({
      compress: true,
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Draw Header with pure jsPDF (no html2canvas)
    let startY = drawPDFHeader(doc);

    // 2. Render Tables per Category
    const renderCategoryTable = (category: 'Kitchen' | 'Mini Bar', currentY: number) => {
      const categoryItems = items.filter(item => item.category === category);
      if (categoryItems.length === 0) return currentY;

      const totalItemsCat = categoryItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const totalValueCat = categoryItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);

      doc.setFont(FONT, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(`${category.toUpperCase()} ASSETS`, 14, currentY);
      
      doc.setFont(FONT, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${categoryItems.length} types  ·  ${totalItemsCat} units  ·  Value: ${formatCurrency(totalValueCat)}`, 14, currentY + 5);

      const tableData = categoryItems.map((item, index) => [
        index + 1,
        item.name,
        formatQty(item.quantity),
        formatAccounting(item.price),
        formatAccounting(item.quantity * item.price),
      ]);

      autoTable(doc, {
        startY: currentY + 8,
        head: [['No', 'Item Name', 'Qty', 'Unit Price', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        styles: { font: FONT, fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        foot: [['', 'TOTAL', `${totalItemsCat} units`, '', formatAccounting(totalValueCat)]],
        footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold', halign: 'right' },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'left' },
          2: { halign: 'right', cellWidth: 20 },
          3: { halign: 'right', cellWidth: 35 },
          4: { halign: 'right', cellWidth: 35 },
        },
        didDrawPage: () => {
          drawFooter(doc, pageWidth, pageHeight);
        }
      });

      return (doc as any).lastAutoTable.finalY + 15;
    };

    const nextY = renderCategoryTable('Kitchen', startY);
    renderCategoryTable('Mini Bar', nextY);

    // 3. Output — try window.open first, fallback to download
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const win = window.open(blobUrl, '_blank');
    
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Laporan_Aset_PSResto_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Gagal menyusun laporan PDF. Silakan coba lagi.");
  } finally {
    hideLoadingOverlay(overlay);
  }
};
