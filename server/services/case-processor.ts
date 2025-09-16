import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { storage } from '../storage';
import { type InsertLegalCase } from '@shared/schema';

interface CaseRow {
  english: string;
  tamil: string;
  batch: string;
  sentence_number: string;
  doc_id: string;
}

export async function processCaseDataset(filePath: string): Promise<number> {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    let rows: Record<string, any>[] = [];

    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // Process Excel file
      rows = await processExcelFile(filePath);
    } else if (fileExtension === '.csv') {
      // Process CSV file
      rows = await processCsvFile(filePath);
    } else {
      throw new Error('Unsupported file format. Please use .xlsx, .xls, or .csv files.');
    }

    let processedCount = 0;

    for (const row of rows) {
      const caseData = await transformRowToCase(row as any);
      if (caseData) {
        await storage.createLegalCase(caseData);
        processedCount++;
      }
    }

    return processedCount;
  } catch (error) {
    console.error('Error processing dataset:', error);
    throw new Error('Failed to process case dataset');
  }
}

async function processExcelFile(filePath: string): Promise<Record<string, any>[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Use first sheet
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with header row
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: '' 
  }) as any[][];

  if (jsonData.length === 0) {
    throw new Error('Excel file is empty');
  }

  const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const rowData: Record<string, any> = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index] ? String(row[index]).trim() : '';
    });

    // Skip empty rows
    const hasContent = Object.values(rowData).some(value => value && String(value).trim().length > 0);
    if (hasContent) {
      rows.push(rowData);
    }
  }

  return rows;
}

async function processCsvFile(filePath: string): Promise<Record<string, any>[]> {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    if (values.length !== headers.length) continue;

    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index];
    });

    rows.push(rowData);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

async function transformRowToCase(row: any): Promise<InsertLegalCase | null> {
  try {
    // Handle both exact column names and case variations
    const english = row.english || row.English || '';
    const tamil = row.tamil || row.Tamil || '';
    const batch = row.batch || row.Batch || '1';
    const sentenceNumber = row.sentence_number || row['sentence number'] || row.SentenceNumber || '1';
    const docId = row.doc_id || row['doc id'] || row.DocId || row.document_id || `CASE_${Date.now()}`;

    if (!english || english.trim().length === 0) {
      console.warn('Skipping row with empty English content');
      return null;
    }

    // Extract metadata from the doc_id and english content
    const { caseTitle, courtType, jurisdiction, judge, caseDate, caseType, tags } = extractCaseMetadata({
      english,
      tamil,
      batch: String(batch),
      sentence_number: String(sentenceNumber),
      doc_id: String(docId)
    });

    return {
      english: english.trim(),
      tamil: tamil ? tamil.trim() : null,
      batch: parseInt(String(batch)) || 1,
      sentenceNumber: parseInt(String(sentenceNumber)) || 1,
      docId: String(docId),
      caseTitle,
      courtType,
      jurisdiction,
      judge,
      caseDate,
      caseType,
      tags,
    };
  } catch (error) {
    console.error('Error transforming row to case:', error);
    console.error('Row data:', row);
    return null;
  }
}

function extractCaseMetadata(row: CaseRow) {
  // Extract case information from doc_id pattern and content analysis
  const docId = row.doc_id;
  let courtType = "District Court";
  let jurisdiction = "Civil";
  let caseType = "General";

  // Analyze doc_id pattern
  if (docId.includes('SC_')) courtType = "Supreme Court";
  else if (docId.includes('HC_')) courtType = "High Court";
  else if (docId.includes('FC_')) courtType = "Family Court";

  if (docId.includes('_CRM_')) jurisdiction = "Criminal";
  else if (docId.includes('_CIV_')) jurisdiction = "Civil";
  else if (docId.includes('_COM_')) jurisdiction = "Commercial";
  else if (docId.includes('_FAM_')) jurisdiction = "Family";

  // Analyze content for case type and metadata
  const content = row.english.toLowerCase();
  
  if (content.includes('contract') || content.includes('breach')) {
    caseType = "Contract Law";
  } else if (content.includes('property') || content.includes('land')) {
    caseType = "Property Law";
  } else if (content.includes('criminal') || content.includes('offense')) {
    caseType = "Criminal Law";
  } else if (content.includes('family') || content.includes('divorce') || content.includes('custody')) {
    caseType = "Family Law";
  } else if (content.includes('constitutional') || content.includes('fundamental rights')) {
    caseType = "Constitutional Law";
  } else if (content.includes('commercial') || content.includes('trade')) {
    caseType = "Commercial Law";
  }

  // Generate case title from content (first meaningful sentence or doc_id)
  let caseTitle = row.english.split('.')[0];
  if (caseTitle.length > 100) {
    caseTitle = caseTitle.substring(0, 100) + '...';
  }
  
  // If content doesn't provide a good title, use doc_id pattern
  if (caseTitle.length < 20) {
    caseTitle = `Case ${docId.replace(/_/g, ' ')}`;
  }

  // Extract potential judge name (look for "Justice" pattern)
  let judge: string | null = null;
  const justiceMatch = row.english.match(/Justice\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (justiceMatch) {
    judge = `Justice ${justiceMatch[1]}`;
  }

  // Generate date from doc_id or use current date
  let caseDate = new Date();
  const yearMatch = docId.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    caseDate = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  }

  // Generate tags from content analysis
  const tags: string[] = [];
  if (content.includes('contract')) tags.push('Contract');
  if (content.includes('property')) tags.push('Property');
  if (content.includes('damages')) tags.push('Damages');
  if (content.includes('breach')) tags.push('Breach');
  if (content.includes('evidence')) tags.push('Evidence');
  if (content.includes('procedure')) tags.push('Procedure');
  if (content.includes('rights')) tags.push('Rights');
  if (content.includes('liability')) tags.push('Liability');

  return {
    caseTitle,
    courtType,
    jurisdiction,
    judge,
    caseDate,
    caseType,
    tags,
  };
}

export async function loadSampleDataset() {
  const samplePath = path.join(process.cwd(), 'server/data/sample-dataset.csv');
  if (fs.existsSync(samplePath)) {
    try {
      await processCaseDataset(samplePath);
      console.log('Sample dataset loaded successfully');
    } catch (error) {
      console.error('Failed to load sample dataset:', error);
    }
  }
}
