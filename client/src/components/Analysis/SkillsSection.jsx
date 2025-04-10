import React, { useState } from 'react';
import { FaTools } from 'react-icons/fa';

const SkillsSection = ({ skills }) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!skills || skills.length === 0) {
    return null;
  }

  const displaySkills = showAll ? skills : skills.slice(0, 15);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaTools className="mr-2 text-indigo-600 dark:text-indigo-400" />
        Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {displaySkills.map((skill, index) => (
          <span 
            key={index} 
            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium animate-fade-in transform hover:scale-105 transition-transform duration-200"
            style={{animationDelay: `${index * 50}ms`}}
          >
            {skill}
          </span>
        ))}
        
        {skills.length > 15 && !showAll && (
          <button 
            onClick={() => setShowAll(true)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            +{skills.length - 15} more
          </button>
        )}
        
        {showAll && (
          <button 
            onClick={() => setShowAll(false)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
