import React from "react";
import { motion } from "framer-motion";
import { Upload, Lightbulb, BarChart3 } from "lucide-react";
// import { container, item } from "@/lib/animations";



const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
const FeaturesSection = () => {
  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Resume",
      description:
        "Simply upload your resume in PDF format to get started. Our system can handle various resume layouts and formats.",
      color: "blue",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "AI Analysis",
      description:
        "Advanced NLP techniques analyze your resume, extracting key information and matching it with company requirements.",
      color: "purple",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Get Ranked",
      description:
        "Receive a personalized ranking of companies where your resume has the highest match score, helping you focus your job search.",
      color: "amber",
    },
  ];

  const colorMap = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="py-12"
    >
      <h2 className="text-3xl font-heading font-bold text-center text-slate-900 dark:text-white mb-10">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={item}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 ${colorMap[feature.color]} rounded-lg flex items-center justify-center mb-5`}
            >
              {feature.icon}
            </div>

            <h3 className="text-xl font-heading font-semibold text-slate-900 dark:text-white mb-3">
              {feature.title}
            </h3>

            <p className="text-slate-600 dark:text-slate-300">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
