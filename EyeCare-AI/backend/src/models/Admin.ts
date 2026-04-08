import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  user: mongoose.Types.ObjectId;
  roleTitle: string; // e.g. "Super Admin", "Hospital Manager"
  permissions: {
    manageUsers: boolean;
    manageDoctors: boolean;
    manageHospitals: boolean;
    viewAnalytics: boolean;
  };
}

const adminSchema = new Schema<IAdmin>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  roleTitle: { type: String, default: 'Super Admin' },
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageDoctors: { type: Boolean, default: true },
    manageHospitals: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model<IAdmin>('Admin', adminSchema);
