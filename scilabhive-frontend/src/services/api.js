import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
});

// Attach token automatically if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getExperiments = async () => {
  const response = await api.get('/experiments/');
  return response.data;
};

export const createExperiment = async (data) => {
  const response = await api.post('/experiments/', {
    title: data.title,
    experiment_type: data.type,
    description: data.description,
    status: data.status,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};


// Get all results for one experiment
export const getResults = async (experimentId) => {
  const response = await api.get(`/experiment_results/${experimentId}/results`);
  return response.data;
};

// Add a result to an experiment
export const addResult = async (experimentId, data) => {
  const response = await api.post(`/experiment_results/${experimentId}/results`, {
    result_name:  data.result_name,
    result_value: data.result_value,
    result_unit:  data.result_unit,
  });
  return response.data;
};

// Delete a result
export const deleteResult = async (resultId) => {
  await api.delete(`/experiment_results/${resultId}`);
};


// Update profile info (name, institution, user_role)
export const updateProfile = async (data) => {
  const response = await api.put('/auth/me', {
    full_name:   data.full_name,
    institution: data.institution,
    user_role:   data.user_role,
  });
  return response.data;
};
 
// Change password
export const changePassword = async (data) => {
  const response = await api.put('/auth/change-password', {
    current_password: data.current_password,
    new_password:     data.new_password,
  });
  return response.data;
};
 
// Upload avatar image
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/auth/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};