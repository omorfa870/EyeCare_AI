import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailability extends Document {
  doctor: mongoose.Types.ObjectId; // Link to User (Doctor)
  dayOfWeek: string;               // e.g. "Monday", "Tuesday"
  startTime: string;               // "09:00" (24h format)
  endTime: string;                 // "17:00"
  maxPatients: number;             // Max slots per day (e.g., 20)
}

const availabilitySchema = new Schema<IAvailability>({
  doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { 
    type: String, 
    required: true, 
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] 
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  maxPatients: { type: Number, default: 20 }
});

// Ensure a doctor can't have 2 schedules for the same day
availabilitySchema.index({ doctor: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model<IAvailability>('Availability', availabilitySchema);
