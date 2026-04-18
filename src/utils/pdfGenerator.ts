import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { InventoryItem } from '../types';
import { formatCurrency, formatAccounting, formatQty } from './formatters';

const FONT_FAMILY = 'helvetica';

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

// ─── RGB Color Forcing Fix (Prevents oklch errors) ──────────────────────────
const rgbForceFix = (clonedDoc: Document) => {
  const elements = clonedDoc.querySelectorAll('*');
  elements.forEach((el) => {
    const HTMLElement = el as HTMLElement;
    const style = window.getComputedStyle(el);
    HTMLElement.style.color = style.color;
    HTMLElement.style.backgroundColor = style.backgroundColor;
    HTMLElement.style.borderColor = style.borderColor;
  });
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

    // 1. Capture Header via html2canvas (Hybrid Logic)
    const headerEl = document.getElementById('header');
    let startY = 15;

    if (headerEl) {
      const canvas = await html2canvas(headerEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        onclone: (clonedDoc) => {
          rgbForceFix(clonedDoc);
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      startY = 10 + imgHeight + 10;
    }

    // 2. Render Tables per Category
    const renderCategoryTable = (category: 'Kitchen' | 'Mini Bar', currentY: number) => {
      const categoryItems = items.filter(item => item.category === category);
      if (categoryItems.length === 0) return currentY;

      const totalItemsCat = categoryItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const totalValueCat = categoryItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);

      doc.setFont(FONT_FAMILY, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text(`${category.toUpperCase()} ASSETS`, 14, currentY);
      
      doc.setFont(FONT_FAMILY, 'normal');
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
        styles: { font: FONT_FAMILY, fontSize: 8, cellPadding: 2.5 },
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
        didDrawPage: (data) => {
          // Footer Logic (Auto-Pagination Ready)
          const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
          const totalPages = (doc as any).internal.getNumberOfPages();
          
          doc.setFontSize(7);
          doc.setFont(FONT_FAMILY, 'normal');
          doc.setTextColor(148, 163, 184);
          
          const footerY = pageHeight - 10;
          const timestamp = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
          const pageLabel = `Halaman ${currentPage}`;
          
          doc.text(timestamp, 14, footerY);
          doc.text(pageLabel, pageWidth - 14 - doc.getTextWidth(pageLabel), footerY);
          doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);
          doc.text('PSResto - Asset Management', pageWidth / 2, footerY, { align: 'center' });
        }
      });

      return (doc as any).lastAutoTable.finalY + 15;
    };

    const nextY = renderCategoryTable('Kitchen', startY);
    renderCategoryTable('Mini Bar', nextY);

    // 3. Output as Blob URL (Printer Browser Method)
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("Gagal menyusun laporan PDF. Silakan coba lagi.");
  } finally {
    hideLoadingOverlay(overlay);
  }
};
