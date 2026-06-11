// src/services/ExportImportService.ts
import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Transaction } from '../types/transaction';
import { Note } from '../context/NoteContext';

/**
 * 将 ArrayBuffer 转为 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ====================== 导出 ======================

export async function exportTransactionsToExcel(
  transactions: Transaction[],
  title: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('交易记录');

  sheet.columns = [
    { header: '日期', key: 'date', width: 18 },
    { header: '类型', key: 'type', width: 10 },
    { header: '分类', key: 'category', width: 12 },
    { header: '金额', key: 'amount', width: 14 },
    { header: '备注', key: 'note', width: 30 },
  ];

  // 标题行
  const titleRow = sheet.addRow([title]);
  titleRow.font = { bold: true, size: 16 };
  sheet.mergeCells(`A1:E1`);
  titleRow.alignment = { horizontal: 'center' };

  // 表头
  const headerRow = sheet.addRow(['日期', '类型', '分类', '金额', '备注']);
  headerRow.font = { bold: true, size: 12 };
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E6ED' },
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  for (const t of transactions) {
    const row = sheet.addRow([t.date, t.type === 'income' ? '收入' : '支出', t.category, t.amount, t.note]);
    const amountCell = row.getCell(4);
    amountCell.font = {
      color: { argb: t.type === 'income' ? 'FF2A9D8F' : 'FFE76F51' },
      bold: true,
    };
    amountCell.numFormat = '¥#,##0.00';
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = arrayBufferToBase64(buffer);
  const fileName = `记账备份_${title}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const filePath = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(filePath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath);
  }
}

export async function exportNotesToExcel(notes: Note[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('记事本');

  sheet.columns = [
    { header: '创建时间', key: 'createdAt', width: 20 },
    { header: '标题', key: 'title', width: 30 },
    { header: '内容', key: 'content', width: 60 },
  ];

  const headerRow = sheet.addRow(['创建时间', '标题', '内容']);
  headerRow.font = { bold: true };
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E6ED' },
    };
  });

  for (const note of notes) {
    sheet.addRow([new Date(note.createdAt).toLocaleString('zh-CN'), note.title, note.content]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = arrayBufferToBase64(buffer);
  const fileName = `笔记备份_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const filePath = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(filePath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath);
  }
}

// ====================== 导入 ======================

export async function importTransactionsFromExcel(): Promise<Partial<Transaction>[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) return [];

  const fileUri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(content, 'base64'));
  const sheet = workbook.getWorksheet('交易记录');
  if (!sheet) return [];

  const transactions: Partial<Transaction>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 2) return; // 跳过标题和表头
    const cells = row.values as string[];
    if (cells.length < 5) return;
    const date = cells[1]?.toString() || '';
    const typeStr = cells[2]?.toString() || '';
    const category = cells[3]?.toString() || '';
    const amountStr = cells[4]?.toString() || '0';
    const note = cells[5]?.toString() || '';

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    transactions.push({
      type: typeStr.includes('收入') ? 'income' : 'expense',
      category,
      amount,
      date,
      note,
      // datetime 和 id 会在导入时重新生成
    });
  });

  return transactions;
}

export async function importNotesFromExcel(): Promise<Partial<Note>[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) return [];

  const fileUri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(content, 'base64'));
  const sheet = workbook.getWorksheet('记事本');
  if (!sheet) return [];

  const notes: Partial<Note>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // 跳过表头
    const cells = row.values as string[];
    if (cells.length < 3) return;
    const title = cells[2]?.toString() || '';
    const content = cells[3]?.toString() || '';
    if (title.trim() === '' && content.trim() === '') return;

    notes.push({
      title,
      content,
      createdAt: new Date().toISOString(),
    });
  });

  return notes;
}