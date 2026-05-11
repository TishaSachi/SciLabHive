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