import axios from 'axios';
import { SymptomPredictionResponse } from '../types';

const symptomApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SYMPTOM_API_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const symptomService = {
  predict: async (symptomText: string): Promise<SymptomPredictionResponse> => {
    const response = await symptomApi.post('/predict', {
      symptom_text: symptomText,
    });
    return response.data;
  },

  healthCheck: async (): Promise<{ status: string }> => {
    const response = await symptomApi.get('/health');
    return response.data;
  },
};

export default symptomApi;
