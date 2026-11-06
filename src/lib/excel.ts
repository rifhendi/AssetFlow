import * as XLSX from 'xlsx';

export function exportToExcel(
  data: Record<string, any>[],
  fileName: string = 'export.xlsx',
  sheetName: string = 'Data'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-fit column widths
  const max_widths = Object.keys(data[0] || {}).map((key) => {
    const headerLen = key.length;
    const maxValLen = Math.max(
      ...data.map((row) => (row[key] ? String(row[key]).length : 0)),
      0
    );
    return { wch: Math.max(headerLen, maxValLen) + 3 };
  });
  worksheet['!cols'] = max_widths;

  // Generate buffer
  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buf;
}

export function parseExcelBuffer(buffer: Buffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}
