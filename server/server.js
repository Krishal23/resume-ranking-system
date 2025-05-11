import dotenv from 'dotenv';
dotenv.config();

import express, { json, static as serveStatic } from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import resumesRouter from './routes/api/resumes.js';
import companiesRouter from './routes/api/companies.js';

const app = express();

connectDB();

const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(json({ extended: false }));

// Routes
app.use('/api/resumes', resumesRouter);
app.use('/api/companies', companiesRouter);

// app.all('/api/:restOfApi*', (req, res) => {
//   res.status(404).send('API Not Found');
// });

// if (process.env.NODE_ENV === 'production') {
//   app.use(serveStatic('client/build'));
//   app.get('/:clientRoute*', (req, res) => {
//     res.sendFile(resolve(process.cwd(), 'client', 'build', 'index.html'));
//   });
// } else {
//   app.all('/:fallback*', (req, res) => {
//     res.status(404).send('Not Found');
//   });
// } // This closing brace for the 'else' block seems correct in this snippet.

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
