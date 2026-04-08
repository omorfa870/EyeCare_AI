import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  user: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies: string[];
  medicalHistory: string[]; // e.g. ["Diabetes", "Hypertension"]
}

const patientSchema = new Schema<IPatient>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  bloodGroup: { type: String },
  allergies: [String],
  medicalHistory: [String]
}, { timestamps: true });

export default mongoose.model<IPatient>('Patient', patientSchema);
