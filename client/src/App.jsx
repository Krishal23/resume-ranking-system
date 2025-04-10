import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import CompaniesShowcase from './components/Company/CompaniesShowcase';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gradient-kinsta">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<CompaniesShowcase />} />
            <Route path="/analysis/:id" element={<AnalysisPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
