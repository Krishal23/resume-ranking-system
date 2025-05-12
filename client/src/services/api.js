import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
 
const API_URL = process.env.REACT_APP_API_URI || 'http://localhost:5000/api'; 
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadResume = (formData) => {
  return api.post('/resumes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getResumeById = (id) => {
  return api.get(`/resumes/${id}`);
};
export const getCompanies = (id) => {
  return api.get(`/companies`);
};

export default api;
