import React from 'react';

const PersonalInfo = ({ name, email, phone }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Name</p>
          <p className="text-gray-900 dark:text-white font-medium">{name || 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
          <p className="text-gray-900 dark:text-white font-medium">{email || 'N/A'}</p>
        </div>
        
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Phone</p>
          <p className="text-gray-900 dark:text-white font-medium">{phone || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
