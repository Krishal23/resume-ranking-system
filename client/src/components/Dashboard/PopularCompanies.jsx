import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Briefcase, Code, Server } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { getCompanies } from "../../services/api";
import { Link } from "react-router-dom";

const cardHover = {
  rest: { scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.02, transition: { duration: 0.3 } },
};

const PopularCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await getCompanies();
        setCompanies(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch companies", err);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const getCompanyIcon = (company) => {
    const name = company.name?.toLowerCase() || "";
    if (name.includes("google") || name.includes("microsoft") || name.includes("amazon")) {
      return <Code className="w-6 h-6" />;
    } else if (name.includes("bank") || name.includes("finance") || name.includes("capital")) {
      return <Building2 className="w-6 h-6" />;
    } else if (company.requiredSkills?.some(skill =>
      skill.toLowerCase().includes("cloud") || skill.toLowerCase().includes("aws")
    )) {
      return <Server className="w-6 h-6" />;
    } else {
      return <Briefcase className="w-6 h-6" />;
    }
  };

  const getColorClass = (index) => {
    const colors = ["amber", "primary", "secondary"];
    return colors[index % colors.length];
  };

  const displayedCompanies = showAll ? companies : companies.slice(0, 6);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="py-12"
    >
      <h2 className="text-3xl font-heading font-bold text-center text-slate-900 dark:text-white mb-4">
        Popular Companies
      </h2>
      <p className="text-center text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto">
        Some of the top companies in our database that are actively looking for candidates
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))
        ) : (
          displayedCompanies.map((company, index) => (
            <motion.div
              key={company._id || index}
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={cardHover}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 dark-transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 bg-${getColorClass(index)}-100 dark:bg-${getColorClass(index)}-900/30 text-${getColorClass(index)}-600 dark:text-${getColorClass(index)}-400 rounded-lg flex items-center justify-center mr-4`}
                  >
                    {getCompanyIcon(company)}
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900 dark:text-white">
                      {company.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {company.internshipRole}
                    </p>
                  </div>
                </div>
              </div>
                <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs font-medium py-1 px-2 rounded">
                  IIT Patna: {company.visitsIITPatna ? "Yes" : "No"}
                </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Min. CPI/GPA</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {company.minCpi || "Not Available"}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Required Skills</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {(company.requiredSkills || []).slice(0, 3).join(", ") || "None"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Branches</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {(company.branchesInvited || []).slice(0, 3).join(", ") || "Any"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      

      <div className="mt-10 text-center">
        <Link to="/companies">
          <button
            className="text-primary-700 dark:text-white bg-primary-50 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-slate-700 border border-primary-200 dark:border-slate-600 py-2 px-4 rounded flex items-center justify-center mx-auto"
          >
            View All Companies
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </Link>
      </div>
    </motion.section>
  );
};

export default PopularCompanies;
