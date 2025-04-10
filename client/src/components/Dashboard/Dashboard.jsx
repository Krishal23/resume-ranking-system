import React from 'react';
import ResumeUploader from './ResumeUploader';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl p-4 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-6 transform hover:scale-105 transition-transform duration-300">
            Resume Ranking System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-pulse-slow">
            Upload your resume to analyze its compatibility with various companies 
            and receive detailed rankings.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
          <ResumeUploader />
        </div>
        
        <div className="mt-12 flex justify-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce delay-100"></span>
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce delay-200"></span>
          <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
