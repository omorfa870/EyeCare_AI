// User Types
export interface User {
  _id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  roleData: any | null;
}

// Patient Types
export interface Patient {
  _id: string;
  user: any;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies: string[];
  medicalHistory: string[];
  createdAt: string;
  updatedAt: string;
}

// Doctor Types
export interface Doctor {
  _id: string;
  user: User;
  specialization: string;
  registrationNumber: string;
  qualifications: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Appointment Types
export interface Appointment {
  _id: string;
  patient: string | User;
  doctor: string | User;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'remote' | 'physical';
  googleMeetLink?: string;
  createdAt: string;
  updatedAt: string;
}

// Eye Record Types
export interface EyeRecord {
  _id: string;
  patient: string;
  doctor?: string;
  visualAcuity: {
    od: string;
    os: string;
  };
  intraocularPressure: {
    od: string;
    os: string;
  };
  scanImage?: string;
  aiAnalysis?: {
    detectedCondition: string;
    probability: number;
    severity: 'low' | 'moderate' | 'severe';
    notes: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Prescription Types
export interface PrescriptionItem {
  brandName: string;
  genericName: string;
  dosage: string;
  duration: string;
  instruction?: string;
}

export interface Prescription {
  _id: string;
  appointment?: string;
  doctor: string | User;
  patient: string | User;
  date: string;
  vitals: {
    bp?: string;
    weight?: string;
    temperature?: string;
  };
  symptoms: string[];
  diagnosis: string[];
  medicines: PrescriptionItem[];
  advice: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Medical Report Types
export interface MedicalReport {
  _id: string;
  patient: string;
  title: string;
  reportType: 'Pathology' | 'Imaging' | 'Prescription' | 'Other';
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Hospital Types
export interface Hospital {
  _id: string;
  name: string;
  branch: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  contactPhone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Medicine Types
export interface Medicine {
  _id: string;
  brandName: string;
  genericName: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Drop' | 'Injection' | 'Ointment';
  manufacturer: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

// Symptom Prediction Types
export interface PredictionItem {
  disease: string;
  confidence: number;
}

export interface SymptomPredictionResponse {
  success: boolean;
  input_symptom: string;
  cleaned_symptom: string;
  predictions: PredictionItem[];
  disclaimer: string;
}

// Eye Image Prediction Types
export interface EyeImagePredictionResponse {
  success: boolean;
  filename?: string;
  predicted_class: string;
  confidence: number;
  all_scores: Record<string, number>;
}
