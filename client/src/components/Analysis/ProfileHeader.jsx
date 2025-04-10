import React from 'react';
import { FaEnvelope, FaPhone, FaGraduationCap } from 'react-icons/fa';

const ProfileHeader = ({ name, email, phone }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="animate-slide-right">
          <h1 className="text-3xl font-bold mb-2">{name}</h1>
          <div className="flex-col flex-wrap gap-3 text-sm">
            <span className="flex items-center">
              <FaEnvelope className="w-4 h-4 mr-1" />
              {email}
            </span>
            <span className="flex mt-2 items-center">
              <FaPhone className="w-4 h-4 mr-1" />
              {phone}
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 animate-slide-left">
          <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg text-white text-sm font-medium">
            <FaGraduationCap className="mr-2 w-4 h-4 " />
            <span>B.Tech Student</span>
            <span className="flex h-2 w-2 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
