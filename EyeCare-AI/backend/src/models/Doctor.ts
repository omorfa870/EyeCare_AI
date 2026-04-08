import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId; // Link to User
  specialization: string;        // e.g. "Retina Specialist"
  registrationNumber: string;    // BMDC Number
  qualifications: string[];      // MBBS, FCPS
  isActive: boolean;
}

const doctorSchema = new Schema<IDoctor>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  qualifications: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IDoctor>('Doctor', doctorSchema);
