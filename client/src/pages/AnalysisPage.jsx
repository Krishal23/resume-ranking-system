import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getResumeById } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResumeAnalysis from '../components/Analysis/ResumeAnalysis';

const AnalysisPage = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

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
  if (error) return <div className="text-red-500">{error}</div>;
  if (!resumeData) return <div>No resume data found</div>;

  return (
    <div>
      {/* <h1 className="text-2xl font-bold mb-4">Resume Analysis</h1> */}
      <ResumeAnalysis/>
    </div>
  );
};

export default AnalysisPage;
