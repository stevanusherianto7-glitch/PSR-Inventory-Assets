import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  
  // High quality column widths
  const max_width = data.reduce((w, r) => Math.max(w, Object.values(r).join("").length), 10);
  worksheet["!cols"] = [ { wch: max_width } ];

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
