import React from 'react';
import { FaGraduationCap } from 'react-icons/fa';

const EducationSection = ({ education }) => {
  if (!education || education.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaGraduationCap className="mr-2 text-indigo-600 dark:text-indigo-400" />
        Education
      </h2>
      <ul className="space-y-4">
        {education.map((edu, index) => (
          <li 
            key={index} 
            className="border-l-2 border-indigo-500 pl-4 py-2 animate-fade-in-up" 
            style={{animationDelay: `${index * 100}ms`}}
          >
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">{edu.degree}</h3>
            <p className="text-indigo-600 dark:text-indigo-400">{edu.institution}</p>
            <div className="flex flex-wrap gap-4 mt-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Year: {edu.year}</p>
              {edu.gpa && <p className="text-sm text-gray-600 dark:text-gray-400">GPA: {edu.gpa}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EducationSection;
