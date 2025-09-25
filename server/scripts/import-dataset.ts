import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { storage } from '../storage';

interface CSVRow {
  english: string;
  tamil: string;
  batch: string;
  sentence_number: string;
  doc_id: string;
}

async function importDataset() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('Usage: tsx server/scripts/import-dataset.ts <path-to-csv-file>');
    process.exit(1);
  }

  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }

  console.log(`Starting import from: ${csvFilePath}`);
  
  const cases: CSVRow[] = [];
  
  // Parse CSV file
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  parser.on('readable', function() {
    let record;
    while (record = parser.read()) {
      cases.push(record);
    }
  });

  parser.on('error', function(err) {
    console.error('CSV parsing error:', err);
    process.exit(1);
  });

  parser.on('end', async function() {
    console.log(`Parsed ${cases.length} records from CSV`);
    
    let importedCount = 0;
    let errorCount = 0;

    for (let index = 0; index < cases.length; index++) {
      const row = cases[index];
      try {
        if (!row.english || !row.batch || !row.sentence_number || !row.doc_id) {
          console.warn(`Skipping row ${index + 1}: Missing required fields`);
          errorCount++;
          continue;
        }

        await storage.createLegalCase({
          english: row.english,
          tamil: row.tamil || null,
          batch: row.batch,
          sentenceNumber: parseInt(row.sentence_number, 10),
          docId: row.doc_id,
          courtType: null,
          caseCategory: null,
          dateDecided: null,
          title: null,
          summary: null,
          aiSummary: null,
          relevanceScore: 0,
        });

        importedCount++;
        
        if (importedCount % 100 === 0) {
          console.log(`Imported ${importedCount} cases...`);
        }
      } catch (error) {
        console.error(`Error importing case ${row.doc_id}:`, error);
        errorCount++;
      }
    }

    console.log(`\nImport completed:`);
    console.log(`- Total records in CSV: ${cases.length}`);
    console.log(`- Successfully imported: ${importedCount}`);
    console.log(`- Errors: ${errorCount}`);
    
    process.exit(0);
  });

  // Read and parse the file
  fs.createReadStream(csvFilePath).pipe(parser);
}

// Run the import
importDataset().catch(console.error);
