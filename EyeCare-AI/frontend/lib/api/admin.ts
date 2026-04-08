import api from '../api';
import { User, Doctor, Patient, Appointment, Hospital } from '../types';

export interface AdminStats {
  counts: {
    estimatedRevenue: number;
    totalAppointments: number;
    totalDoctors: number;
    totalPatients: number;
  },
  recentActivity:{
    appointments: Appointment[];
    newUsers: User[];
  }
}

export interface UpdateUserData {
  doctorId: string;
  isActive?: boolean;
  role?: 'doctor';
}

export interface CreateHospitalData {
  name: string;
  branch?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string; // optional since backend defaults to Bangladesh
  };
  location: {
    latitude: number;
    longitude: number;
  };
  contactPhone: string;
  email?: string;
}

export interface UpdateHospitalData extends Partial<CreateHospitalData> {
  id: string;
}

export const adminApi = {
  // Get admin dashboard stats
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get all doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/doctors');
    return response.data;
  },

  // Get all patients
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await api.get('/admin/patients');
    return response.data;
  },

  // Get all appointments
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/admin/appointments');
    return response.data;
  },

  // Update user status
  updateDoctorStatus: async (data: UpdateUserData) => {
    const response = await api.put(`/doctors/${data.doctorId}`, {
      isActive: data.isActive,
      role: data.role,
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getHospitals: async (): Promise<Hospital[]> => {
    const res = await api.get('/hospitals');
    return res.data;
  },

  createHospital: async (data: CreateHospitalData): Promise<Hospital> => {
    const res = await api.post('/hospitals', data);
    return res.data;
  },

  updateHospital: async (data: UpdateHospitalData): Promise<Hospital> => {
    const { id, ...payload } = data;
    const res = await api.put(`/hospitals/${id}`, payload);
    return res.data;
  },

  deleteHospital: async (id: string) => {
    const res = await api.delete(`/hospitals/${id}`);
    return res.data;
  },
};
