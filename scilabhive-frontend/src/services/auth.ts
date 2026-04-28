import { api } from "./api";

export const login = async (email: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
};

export const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  institution: string,
  user_role: string
) => {
  const response = await api.post("/auth/register", {
    full_name: `${firstName} ${lastName}`,
    email,
    password,
    institution,
    user_role,
  });

  return response.data;
};

