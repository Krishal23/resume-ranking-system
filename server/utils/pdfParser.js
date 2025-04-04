// server/utils/pdfParser.js
import { readFileSync } from 'fs';
import PDF from 'pdf-parse';

export const parsePDF = async (filePath) => {
  try {
    const dataBuffer = readFileSync(filePath);
    const data = await PDF(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

