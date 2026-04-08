import api from '../api';
import { Doctor, Hospital, Medicine, User } from '../types';

// Extended Doctor type with user info
export interface DoctorWithUser extends Doctor {
  user: User;
}

export const commonApi = {
  // Get all doctors
  getDoctors: async (): Promise<DoctorWithUser[]> => {
    const response = await api.get('/doctors');
    return response.data;
  },

  // Search doctors by name or specialization
  searchDoctors: async (query: string): Promise<DoctorWithUser[]> => {
    const response = await api.get('/doctors/search', {
      params: { query },
    });
    return response.data;
  },

  // Get all hospitals
  getHospitals: async (): Promise<Hospital[]> => {
    const response = await api.get('/hospitals');
    return response.data;
  },

  // Search medicines
  searchMedicines: async (search: string): Promise<Medicine[]> => {
    const response = await api.get('/medicines', {
      params: { search },
    });
    return response.data;
  },
};
