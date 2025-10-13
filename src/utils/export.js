// src/utils/export.js
function escapeCSVField(value) {
    const s = value == null ? '' : String(value);
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }
  
  export function toCSV(rows, columns) {
    const header = columns.map(c => escapeCSVField(c.label ?? c.key)).join(',');
    const body = rows
      .map(r => columns.map(c => escapeCSVField(r[c.key])).join(','))
      .join('\n');
    return '\uFEFF' + header + '\n' + body;
  }
  
  export function downloadCSV(csvString, filename = 'export.csv') {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }