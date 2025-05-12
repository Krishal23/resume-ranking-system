import  { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Skeleton } from "../../components/ui/skeleton";
import { FaBuilding, FaSearch} from 'react-icons/fa';
import { getCompanies } from '../../services/api';

const CompaniesShowcase = ({ rankings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companiesData, setCompaniesData] = useState([]);
  const [industryFilter, ] = useState('All');
  const [sortBy, ] = useState('name');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await getCompanies();

        const companiesArray = response.data.map((company, index) => ({
          _id: company?._id || index.toString(),
          companyId: company?._id,
          name: company?.name,
          cpi: company?.cpi,
          skillSet: company?.skillSet,
          internshipRole: company?.internshipRole,
          visitsIITPatna: company?.visitsIITPatna,
          minProjects: company?.minProjects,
          projectKeywords: company?.projectKeywords,
          branch: company?.branch,
          dsaRequired: company?.dsaRequired,
          coreSkills: company?.coreSkills,
          industry: company?.industry || "Unknown"
        }));

        setCompaniesData(companiesArray);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch companies', err);
        setError('Failed to load companies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);


  // Filter and sort companies
  const filteredCompanies = companiesData
    .filter(company => {
      if (typeof company.name === 'string') {
        return company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (industryFilter === 'All' || company.industry === industryFilter);
      }
      return false;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'industry') {
        return a.industry.localeCompare(b.industry);
      } else if (sortBy === 'compatibility') {
        const aScore = calculateCompatibilityScore(a);
        const bScore = calculateCompatibilityScore(b);
        return bScore - aScore; // Higher score first
      }
      return 0;
    });

  const calculateCompatibilityScore = (company) => {
    let score = 0;
    if (company.cpi) {
      score += (10 - company.cpi) * 10;
    }

    if (company.skillSet && company.skillSet.length) {
      score += company.skillSet.length * 5;
    }

    return Math.min(Math.max(score, 0), 100);
  };


  // // console.log(companiesData)
  // // Filter and sort companies
  // const filteredCompanies = companiesData
  // .filter(company => {
  //   // Check if company.name exists and is a string
  //   if (typeof company.name === 'string') {
  //     return company.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
  //       (industryFilter === 'All' || company.industry === industryFilter);
  //   }
  //   return false; // Skip items without a valid name
  // })
  // .sort((a, b) => {
  //   // Your existing sort logic
  // });
  // // console.log(filteredCompanies)


  // const containerVariants = {
  //   hidden: { opacity: 0 },
  //   visible: { 
  //     opacity: 1,
  //     transition: { 
  //       staggerChildren: 0.1
  //     }
  //   }
  // };

  // const itemVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: { 
  //     y: 0, 
  //     opacity: 1,
  //     transition: { type: "spring", stiffness: 100 }
  //   },
  //   hover: { 
  //     scale: 1.03,
  //     boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  //     transition: { type: "spring", stiffness: 400, damping: 10 }
  //   }
  // };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 rounded-2xl shadow-xl overflow-hidden my-12 p-8"
    >
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Company Compatibility Analysis
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
        >
          Explore how well your skills match with requirements from top companies across various industries.
        </motion.p>
      </div>

      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        {/* Search input */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {/* <div className="flex gap-4">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {industries.map((industry, index) => (
                <option key={index} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="compatibility">Sort by Compatibility</option>
            <option value="name">Sort by Name</option>
            <option value="industry">Sort by Industry</option>
          </select>
        </div> */}
      </motion.div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 h-48">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCompanies.map((company) => (
            <motion.div
              key={company._id}
              variants={itemVariants}
              whileHover="hover"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg mr-4">
                      <FaBuilding className="text-indigo-600 dark:text-indigo-400 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{company.name}</h3>
                      {/* <p className="text-sm text-indigo-600 dark:text-indigo-400">{company.industry || 'Industry not specified'}</p> */}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Visits IIt Patna: {company.visitsIITPatna ? "Yes" : "No"}</p>
                </div>
                {/* CPI Requirement */}
                {company.cpi && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">CPI Requirement: {company.cpi}</p>
                  </div>
                )}

                {/* Compatibility Score */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Compatibility Score</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
                        style={{ width: `${calculateCompatibilityScore(company)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[45px] text-right">
                      {calculateCompatibilityScore(company).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Skills */}
                {company.skillSet && company.skillSet.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {company.skillSet.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {company.skillSet.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          +{company.skillSet.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    {company.internshipRole && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Role:</span> {company.internshipRole}
                      </p>
                    )}
                    {company.branch && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Branch:</span> {company.branch}
                      </p>
                    )}
                    {company.minProjects !== undefined && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Min Projects:</span> {company.minProjects}
                      </p>
                    )}
                    {company.dsaRequired !== undefined && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">DSA Required:</span> {company.dsaRequired ? 'Yes' : 'No'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && !error && filteredCompanies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-600 dark:text-gray-400">No companies match your search criteria.</p>
        </motion.div>
      )}
    </motion.section>
  );

}

export default CompaniesShowcase;
