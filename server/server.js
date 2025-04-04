const express = require('express');
const connectDB = require('./config/db').default;
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/resumes', require('./routes/api/resumes'));
app.use('/api/companies', require('./routes/api/companies'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
