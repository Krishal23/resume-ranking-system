import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-700 dark:text-gray-300">
          &copy; {new Date().getFullYear()} Resume Ranking System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
