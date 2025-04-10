import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../../services/api';

const ResumeUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      const response = await uploadResume(formData);
      console.log(response?.data?.resume?.id)
      navigate(`/analysis/${response?.data?.resume?.id}`);
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-center mb-10">
          <button
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
            onClick={() => document.getElementById('resumeUpload').click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Upload Resume
          </button>
          <input
            id="resumeUpload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          
        </div>
          
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
        <div className="flex items-center justify-between mt-3">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={!file || loading}
          >
            {loading ? 'Uploading...' : 'Upload and Analyze'}
          </button>
          {file && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              Selected file: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>
        
      </form>
    </div>
  );
};

export default ResumeUploader;
