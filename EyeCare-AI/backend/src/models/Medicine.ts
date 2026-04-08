import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  brandName: string;    // e.g., "Napa"
  genericName: string;  // e.g., "Paracetamol"
  strength: string;     // e.g., "500mg"
  form: string;         // e.g., "Tablet", "Syrup", "Drop"
  manufacturer: string; // e.g., "Beximco"
  price?: number;
}

const medicineSchema = new Schema<IMedicine>({
  brandName: { type: String, required: true, index: true },
  genericName: { type: String, required: true },
  strength: { type: String, required: true },
  form: { 
    type: String, 
    required: true, 
    enum: ['Tablet', 'Capsule', 'Syrup', 'Drop', 'Injection', 'Ointment'] 
  },
  manufacturer: { type: String },
  price: { type: Number }
}, { timestamps: true });

// Text index for fast searching by doctor
medicineSchema.index({ brandName: 'text', genericName: 'text' });

export default mongoose.model<IMedicine>('Medicine', medicineSchema);
