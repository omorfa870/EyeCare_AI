import api from '../api';

export interface RegisterData {
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';  // ← Changed from string to specific types
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  roleData: any;
  token: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};
