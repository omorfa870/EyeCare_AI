import api from '../api';
import { Patient, Appointment, EyeRecord, Prescription, MedicalReport } from '../types';

export interface CreatePatientProfileData {
  user: string;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies: string[];
  medicalHistory: string[];
}

export interface BookAppointmentData {
  patientId: string;
  doctorId: string;
  date: string;
  reason: string;
  type: 'remote' | 'physical';
}

export interface PatientStats {
  totalScans: number;
  totalAppointments: number;
  totalPrescriptions: number;
  totalReports: number;
}

export const patientApi = {
  // Create patient profile
  createProfile: async (data: CreatePatientProfileData): Promise<Patient> => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  // Get patient stats for dashboard
  getStats: async (patientId: string): Promise<PatientStats> => {
    const response = await api.get('/patient/dashboard', {
      params: { patientId },
    });
    return response.data;
  },

  // Book appointment
  bookAppointment: async (data: BookAppointmentData): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // Get appointments
  getAppointments: async (userId: string): Promise<Appointment[]> => {
    const response = await api.get('/appointments', {
      params: { userId, type: 'patient' },
    });
    return response.data;
  },

  // Upload and analyze eye scan
  analyzeEyeScan: async (patientId: string, doctorId: string, scan: File): Promise<EyeRecord> => {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('doctorId', doctorId);
    formData.append('scan', scan);

    const response = await api.post('/ai/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get patient records (eye records)
  getRecords: async (patientId: string): Promise<EyeRecord[]> => {
    const response = await api.get(`/records/${patientId}`);
    return response.data;
  },

  // Get prescriptions
  getPrescriptions: async (patientId: string): Promise<Prescription[]> => {
    const response = await api.get(`/patients/${patientId}/prescriptions`);
    return response.data;
  },

  // Get single prescription by ID
  getPrescriptionById: async (id: string): Promise<Prescription> => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  // Get reports
  getReports: async (patientId: string): Promise<MedicalReport[]> => {
    const response = await api.get(`/reports/${patientId}`);
    return response.data;
  },

  // Upload report
  uploadReport: async (patientId: string, title: string, reportType: string, file: File): Promise<MedicalReport> => {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('title', title);
    formData.append('reportType', reportType);
    formData.append('file', file);

    const response = await api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
