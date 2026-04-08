import mongoose, { Schema, Document } from 'mongoose';

// Sub-schema for individual line items
const prescriptionItemSchema = new Schema({
  brandName: { type: String, required: true },
  genericName: { type: String, required: true },
  strength: { type: String, required: true },
  form: { type: String, required: true },
  dosage: { type: String, required: true },      // e.g., "1+0+1"
  duration: { type: String, required: true },    // e.g., "7 days"
  instruction: { type: String }                  // e.g., "After meal"
}, { _id: false });

export interface IPrescription extends Document {
  appointment?: mongoose.Types.ObjectId; // Optional link to an appointment
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  date: Date;
  vitals: {
    bp?: string;
    weight?: string;
    temperature?: string;
  };
  symptoms: string[];
  diagnosis: string[];
  medicines: any[]; // Using the sub-schema structure
  advice: string;
  followUpDate?: Date;
}

const prescriptionSchema = new Schema<IPrescription>({
  appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  
  vitals: {
    bp: String,
    weight: String,
    temperature: String
  },
  
  symptoms: [String],
  diagnosis: [String], // e.g., ["Myopia", "Conjunctivitis"]
  
  medicines: [prescriptionItemSchema],
  
  advice: { type: String }, // General advice like "Rest for 2 days"
  followUpDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IPrescription>('Prescription', prescriptionSchema);
