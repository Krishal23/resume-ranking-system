import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResumeById } from '../../services/api';

import CompanyRankings from './CompanyRankings';
import LoadingSpinner from '../common/LoadingSpinner';
import ProfileHeader from './ProfileHeader';
import SkillsSection from './SkillsSection';
import EducationSection from './EducationSection';
import ExperienceSection from './ExperienceSection';
import ProjectsSection from './ProjectsSection';
import CompaniesShowcase from '../Company/CompaniesShowcase';

const ResumeAnalysis = () => {
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const response = await getResumeById(id);
                setResumeData(response.data);
            } catch (err) {
                setError('Failed to fetch resume data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResumeData();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg animate-fade-in">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
                <p className="text-gray-700 dark:text-gray-300">{error}</p>
            </div>
        </div>
    );
    if (!resumeData) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Data Found</h2>
                <p className="text-gray-600 dark:text-gray-400">No resume data available for analysis.</p>
            </div>
        </div>
    );
    return (
        <div className="py-12 bg-gray-50 dark:bg-gradient-kinsta min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    Let's Analyze Your Resume
                </h1>
                <div className="flex justify-center mb-10">
                    <button
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
                        onClick={()=>{navigate('/')}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Upload Another Resume
                    </button>
                </div>

                <ProfileHeader
                    name={resumeData.name}
                    email={resumeData.email}
                    phone={resumeData.phone}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <EducationSection education={resumeData.education} />
                    <ExperienceSection experience={resumeData.experience} />
                </div>
                <div>
                    <SkillsSection skills={resumeData.skills} />
                </div>
                <div className="my-8">
                    <ProjectsSection projects={resumeData?.projects} />
                </div>

                <CompanyRankings rankings={resumeData.rankings} />
                {/* <CompaniesShowcase rankings={resumeData?.rankings}/> */}
            </div>
        </div>
    );
};

export default ResumeAnalysis;
