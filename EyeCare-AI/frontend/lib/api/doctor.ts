import api from '../api';
import { Doctor, Appointment, Prescription, Patient } from '../types';

export interface CreateDoctorProfileData {
  user: string;
  specialization: string;
  registrationNumber: string;
  qualifications: string[];
}

export interface CreatePrescriptionData {
  appointmentId?: string;
  doctorId: string;
  patientId: string;
  vitals: {
    bp?: string;
    weight?: string;
    temperature?: string;
  };
  symptoms: string[];
  diagnosis: string[];
  medicines: {
    medicine: string;
    medicineName: string;
    dosage: string;
    duration: string;
    instruction?: string;
  }[];
  advice: string;
  followUpDate?: string;
}

export interface UpdateAppointmentStatusData {
  appointmentId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface DoctorStats {
  totalAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  pendingAppointments: number;
}

export interface SetAvailabilityData {
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
}

export interface Availability {
  _id: string;
  doctor: string | Doctor;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
}

export interface UpdateAvailabilityData {
  id: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
}

export const doctorApi = {
  // Create doctor profile
  createProfile: async (data: CreateDoctorProfileData): Promise<Doctor> => {
    const response = await api.post('/doctors', data);
    return response.data;
  },

  // Get doctor stats
  getStats: async (doctorId: string): Promise<DoctorStats> => {
    const response = await api.get('/doctor/dashboard', {
      params: { doctorId },
    });
    return response.data;
  },

  // Get appointments
  getAppointments: async (userId: string): Promise<Appointment[]> => {
    const response = await api.get('/appointments', {
      params: { userId, type: 'doctor' },
    });
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (data: UpdateAppointmentStatusData) => {
    const response = await api.put(`/appointments/${data.appointmentId}/status`, {
      status: data.status,
    });
    return response.data;
  },

  // Add Google Meet link
  addMeetLink: async (appointmentId: string, googleMeetLink: string) => {
    const response = await api.put(`/appointments/${appointmentId}/meet-link`, {
      googleMeetLink,
    });
    return response.data;
  },

  // Create prescription
  createPrescription: async (data: CreatePrescriptionData): Promise<Prescription> => {
    const response = await api.post('/prescriptions', data);
    return response.data;
  },

  // Get prescription by ID
  getPrescription: async (id: string): Promise<Prescription> => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  // Get patient records
  getPatientRecords: async (patientId: string) => {
    const response = await api.get(`/records/${patientId}`);
    return response.data;
  },

  // Get all prescriptions created by doctor
  getDoctorPrescriptions: async (doctorId: string): Promise<Prescription[]> => {
    const response = await api.get('/prescriptions', {
      params: { doctorId },
    });
    return response.data;
  },

  setAvailability: async (data: SetAvailabilityData): Promise<Availability> => {
    const res = await api.post('/availability', data);
    return res.data;
  },

  getAvailability: async (doctorId: string): Promise<Availability[]> => {
    const res = await api.get(`/doctors/${doctorId}/availability`);
    return res.data;
  },

  updateAvailability: async (data: UpdateAvailabilityData): Promise<Availability> => {
    const res = await api.put(`/availability/${data.id}`, {
      startTime: data.startTime,
      endTime: data.endTime,
      maxPatients: data.maxPatients,
    });
    return res.data;
  },

  // Upload and analyze eye scan
  analyzeEyeScan: async (patientId: string, doctorId: string, scan: File) => {
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
};
