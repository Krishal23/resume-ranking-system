import React, { useState, useEffect } from "react";
import { getCompanies } from "../../services/api";
import { motion } from "framer-motion";
import { IoChevronForward, IoChevronBack, IoArrowUp, IoArrowDown } from "react-icons/io5";

const CompanyRankings = ({ rankings }) => {
  const [companies, setCompanies] = useState({});
  const [sortField, setSortField] = useState("rank");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getCompanies();
        const companyMap = {};
        response.data.forEach((company) => {
          companyMap[company._id] = company.name;
        });
        setCompanies(companyMap);
      } catch (err) {
        console.error("Failed to fetch companies", err);
      }
    };

    fetchCompanies();
  }, []);

  // Filter rankings based on search term
  const filteredRankings = rankings.filter((ranking) =>
    ranking.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort rankings
  const sortedRankings = [...filteredRankings].sort((a, b) => {
    if (sortField === "company") {
      return sortDirection === "asc"
        ? a.company.name.localeCompare(b.company.name)
        : b.company.name.localeCompare(a.company.name);
    }
    return sortDirection === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedRankings.length / itemsPerPage);
  const currentItems = sortedRankings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); 
  };


  const getRankColor = (rank) => {
    if (rank === 1) return "text-yellow-500 dark:text-yellow-300"; 
    if (rank === 2) return "text-gray-400 dark:text-gray-300";
    if (rank === 3) return "text-amber-600 dark:text-amber-400";
    return "text-blue-600 dark:text-blue-300"; 
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold">Company Rankings</h2>
        <p className="mt-2 text-sm text-blue-100">Discover top-performing companies based on match scores</p>

      </div>

      {/* Search Bar */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {currentItems.length === 0 ? (
          <div className="flex justify-center items-center p-8 text-gray-500 dark:text-gray-400">
            No companies found matching your search
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                {[
                  { id: "company", label: "Company" },
                  { id: "score", label: "Match Score" },
                  { id: "rank", label: "Rank" }
                ].map((column) => (
                  <th
                    key={column.id}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortField === column.id && (
                        <span className="text-blue-500 dark:text-blue-400">
                          {sortDirection === "asc" ? <IoArrowUp /> : <IoArrowDown />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
            >
              {currentItems.map((ranking, index) => (
                <motion.tr
                  key={ranking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {ranking.company.name}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span className="mr-2">{ranking.score.toFixed(2)}</span>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${ranking.score}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${ranking.rank <= 3
                        ? 'bg-blue-100 dark:bg-blue-900/50'
                        : 'bg-gray-100 dark:bg-gray-800'
                      } ${getRankColor(ranking.rank)}`}>
                      {ranking.rank}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
            whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
            className={`px-4 py-2 rounded-md flex items-center ${currentPage === 1
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
          >
            <IoChevronBack className="mr-1" /> Previous
          </motion.button>

          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              // Logic to show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (currentPage <= 3) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = currentPage - 2 + idx;
              }

              // Only render if pageNum is valid
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <motion.button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === pageNum
                        ? "bg-blue-500 dark:bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      } border border-gray-300 dark:border-gray-600`}
                  >
                    {pageNum}
                  </motion.button>
                );
              }
              return null;
            })}
          </div>

          <motion.button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
            whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
            className={`px-4 py-2 rounded-md flex items-center ${currentPage === totalPages
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
          >
            Next <IoChevronForward className="ml-1" />
          </motion.button>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        Showing {currentItems.length} of {filteredRankings.length} companies
      </div>
    </motion.div>
  );
};

export default CompanyRankings;
