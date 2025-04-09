import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import Company from '../models/Company.js';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, '../.env') })

console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const results = [];


fs.createReadStream(path.join(__dirname, '../data/companies.csv'))
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    try {
      console.log(`Importing ${results.length} companies...`);
      
      for (const row of results) {
        const company = {
          name: row['Company Name'],
          cpi: row['Minimum CPI/GPA'] === 'Not Available' ? 0 : parseFloat(row['Minimum CPI/GPA']) || 0,
          skillSet: row['Required Skills'] ? row['Required Skills'].split(',').map(s => s.trim()) : [],
          internshipRole: row['Internship Role'],
          visitsIITPatna: row['Visits IIT Patna'] === 'YES',
          minProjects: row['No of Projects'] ? parseInt(row['No of Projects']) : 0,
          projectKeywords: row['Key words in project'] ? row['Key words in project'].split(',').map(k => k.trim()) : [],
          branch: row['Branches Invited'] ? row['Branches Invited'].split(',').map(b => b.trim()) : [],
          dsaRequired: row['DSA REQUIRED'] === 'YES',
          coreSkills: row['CORE COMPUTER SKILLS'] && row['CORE COMPUTER SKILLS'] !== 'None' 
            ? row['CORE COMPUTER SKILLS'].split(',').map(s => s.trim()) 
            : []
        };
        
        // already exists??
        const existingCompany = await Company.findOne({ name: company.name });
        
        if (existingCompany) {
          console.log(`Updating existing company: ${company.name}`);
          await Company.findByIdAndUpdate(existingCompany._id, company);
        } else {
          console.log(`Creating new company: ${company.name}`);
          await Company.create(company);
        }
      }
      
      console.log('Import completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Error importing data:', error);
      process.exit(1);
    }
  });
