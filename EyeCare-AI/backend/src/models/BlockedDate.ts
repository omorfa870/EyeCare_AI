import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockedDate extends Document {
  doctor: mongoose.Types.ObjectId;
  date: string; // ISO date string YYYY-MM-DD
}

const blockedDateSchema = new Schema<IBlockedDate>({
  doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // e.g. "2025-04-15"
}, { timestamps: true });

// Unique per doctor per date
blockedDateSchema.index({ doctor: 1, date: 1 }, { unique: true });

export default mongoose.model<IBlockedDate>('BlockedDate', blockedDateSchema);
