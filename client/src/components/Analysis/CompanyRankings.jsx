import React, { useState, useEffect } from 'react';
import { getCompanies } from '../../services/api';

const CompanyRankings = ({ rankings }) => {
  const [companies, setCompanies] = useState({});
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getCompanies();
        const companyMap = {};
        response.data.forEach(company => {
          companyMap[company._id] = company.name;
        });
        setCompanies(companyMap);
      } catch (err) {
        console.error('Failed to fetch companies', err);
      }
    };
    
    fetchCompanies();
  }, []);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedRankings = [...rankings].sort((a, b) => {
    if (sortField === 'company') {
      const companyA = companies[a.company] || '';
      const companyB = companies[b.company] || '';
      return sortDirection === 'asc' 
        ? companyA.localeCompare(companyB)
        : companyB.localeCompare(companyA);
    }
    
    return sortDirection === 'asc' 
      ? a[sortField] - b[sortField]
      : b[sortField] - a[sortField];
  });

  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white p-6 border-b border-gray-200 dark:border-gray-800">
        Company Rankings
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('company')}
              >
                Company {sortField === 'company' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('score')}
              >
                Match Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rank')}
              >
                Rank {sortField === 'rank' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {sortedRankings.map((ranking) => (
              <tr key={ranking._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {ranking.company.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {ranking.score.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {ranking.rank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyRankings;
