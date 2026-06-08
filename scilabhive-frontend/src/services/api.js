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
  // Convert file to base64 on the frontend
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result); // gives "data:image/jpeg;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await api.put('/auth/upload-avatar', {
    avatar_base64: base64,
  });
  return response.data;
};

export const deleteAccount = async () => {
  await api.delete('/auth/me');
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', {
    email,
    otp,
  });
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

export const getResultsStats = async () => {
  const response = await api.get('/experiment_results/stats');
  return response.data;
};

export const getMyCollaborators  = async () => (await api.get('/collaborators/my')).data;
export const getMyInvitations    = async () => (await api.get('/collaborators/invitations')).data;
export const inviteCollaborator  = async (data) => (await api.post('/collaborators/invite', data)).data;
export const acceptInvitation    = async (id) => (await api.put(`/collaborators/${id}/accept`)).data;
export const declineInvitation   = async (id) => (await api.put(`/collaborators/${id}/decline`)).data;
export const removeCollaborator  = async (id) => await api.delete(`/collaborators/${id}`);