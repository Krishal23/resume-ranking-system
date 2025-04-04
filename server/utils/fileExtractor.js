
import { readFileSync } from 'fs';
import { extname } from 'path';
import { parsePDF } from './pdfParser.js';



const extractTextFromPDF = async (filePath) => {
  try {
    return await parsePDF(filePath);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};


export const extractTextFromFile = async (filePath) => {
  const extension = extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return await extractTextFromPDF(filePath);
    case '.txt':
      return readFileSync(filePath, 'utf8');
    case '.docx':
    case '.doc':
      // Implement docx extraction if needed
      throw new Error('DOCX/DOC extraction not implemented');
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
};

