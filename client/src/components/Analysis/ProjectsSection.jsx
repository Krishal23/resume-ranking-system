import React from 'react';
import { FaCode } from 'react-icons/fa';

const ProjectsSection = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaCode className="mr-2 text-indigo-600 dark:text-indigo-400" />
        Projects
      </h2>
      <ul className="space-y-6">
        {projects.map((project, index) => (
          <li 
            key={index} 
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0 animate-fade-in-right transform hover:translate-x-1 transition-transform duration-300" 
            style={{animationDelay: `${index * 100}ms`}}
          >
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">{project.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, techIndex) => (
                <span 
                  key={techIndex}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsSection;
