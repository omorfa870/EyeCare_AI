import mongoose, { Schema, Document } from 'mongoose';

export interface IEyeRecord extends Document {
  patient: mongoose.Types.ObjectId;
  doctor?: mongoose.Types.ObjectId;
  
  // Specific Eye Data (OD = Right, OS = Left)
  visualAcuity: {
    od: string; // e.g. 6/6
    os: string; // e.g. 6/9
  };
  intraocularPressure: {
    od: string; // mmHg
    os: string;
  };
  
  // AI Analysis Section
  scanImage?: string; // Filename
  aiAnalysis?: {
    detectedCondition: string;
    probability: number; // 0-1
    severity: 'low' | 'moderate' | 'severe';
    notes: string;
  };
}

const eyeRecordSchema = new Schema<IEyeRecord>({
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'User' },
  
  visualAcuity: {
    od: { type: String, default: 'N/A' },
    os: { type: String, default: 'N/A' }
  },
  intraocularPressure: {
    od: { type: String, default: 'N/A' },
    os: { type: String, default: 'N/A' }
  },

  scanImage: { type: String },
  aiAnalysis: {
    detectedCondition: String,
    probability: Number,
    severity: { type: String, enum: ['low', 'moderate', 'severe'] },
    notes: String
  }
}, { timestamps: true });

export default mongoose.model<IEyeRecord>('EyeRecord', eyeRecordSchema);
