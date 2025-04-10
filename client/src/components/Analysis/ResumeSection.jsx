import React from 'react';

const ResumeSection = ({ title, items }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
      
      {items && items.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No information available.</p>
      )}
    </div>
  );
};

export default ResumeSection;
