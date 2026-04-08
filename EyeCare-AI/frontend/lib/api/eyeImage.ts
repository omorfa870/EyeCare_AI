import axios from 'axios';
import { EyeImagePredictionResponse } from '../types';

const eyeImageApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EYE_IMAGE_API_URL || 'http://localhost:8002',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const eyeImageService = {
  predict: async (file: File): Promise<EyeImagePredictionResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await eyeImageApi.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  healthCheck: async (): Promise<{
    status: string;
    models_loaded: boolean;
    model_names: string[];
    class_names: string[];
    weights: number[];
  }> => {
    const response = await eyeImageApi.get('/health');
    return response.data;
  },
};

export default eyeImageApi;
