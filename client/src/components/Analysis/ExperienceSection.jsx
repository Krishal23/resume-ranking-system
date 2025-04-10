import React from 'react';
import { FaBriefcase } from 'react-icons/fa';

const ExperienceSection = ({ experience }) => {
  if (!experience || experience.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaBriefcase className="mr-2 text-indigo-600 dark:text-indigo-400" />
        Experience
      </h2>
      <ul className="space-y-4">
        {experience.map((exp, index) => (
          <li 
            key={index} 
            className="border-l-2 border-indigo-500 pl-4 py-2 animate-fade-in-left" 
            style={{animationDelay: `${index * 100}ms`}}
          >
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">
              {exp.company !== "Unknown" ? exp.company : "Experience"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exp.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExperienceSection;
