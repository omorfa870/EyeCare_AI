import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  branch: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  // NEW: Geo-location
  location: {
    latitude: number;
    longitude: number;
  };
  contactPhone: string;
  email: string;
  isActive: boolean;
}

const hospitalSchema = new Schema<IHospital>({
  name: { type: String, required: true, trim: true },
  branch: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Bangladesh' }
  },
  // NEW: Schema definition
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  contactPhone: { type: String, required: true },
  email: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IHospital>('Hospital', hospitalSchema);
