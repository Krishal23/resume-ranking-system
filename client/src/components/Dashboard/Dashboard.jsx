import React from 'react';
import ResumeUploader from './ResumeUploader';
import  FeaturesSection  from './FeaturesSection';
import PopularCompanies from './PopularCompanies';

const Dashboard = () => {
  return (
    <div className="min-h-screen dark:bg-black bg-white px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl p-2 font-extrabold text-transparent bg-clip-text bg-black  dark:bg-white mb-6 transform hover:scale-105 transition-transform duration-300">
          Find Your Perfect Company Match
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-pulse-slow">
            Upload your resume to analyze its compatibility with various companies 
            and receive detailed rankings.
          </p>
        </div>
        
        
        <div className=" p-6 transform hover:shadow-2xl dark:shadow-zinc-800 transition-all duration-300 animate-fade-in-up">
        
          <ResumeUploader />
        </div>
        <div className=" p-8 transform hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
          <FeaturesSection />
        </div>
        <div className=" p-8 transform hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
          <PopularCompanies />
        </div>
        
        
      </div>
    </div>
  );
};

export default Dashboard;
