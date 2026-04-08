import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId; // User ID
  doctor: mongoose.Types.ObjectId;  // Doctor ID (Profile ID) or User ID? Let's use User ID for simplicity in querying
  date: Date;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'remote' | 'physical';
  googleMeetLink?: string;
}

const appointmentSchema = new Schema<IAppointment>({
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  reason: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['remote', 'physical'], 
    required: true,
    default: 'physical' 
  },
  googleMeetLink: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
