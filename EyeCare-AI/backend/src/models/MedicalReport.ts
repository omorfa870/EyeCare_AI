import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicalReport extends Document {
  patient: mongoose.Types.ObjectId;
  title: string;       // e.g., "Blood Test Results 2023"
  reportType: string;  // e.g., "Pathology", "X-Ray", "Prescription"
  fileUrl: string;     // Path to the file
  fileType: string;    // "application/pdf" or "image/jpeg"
  uploadedAt: Date;
}

const medicalReportSchema = new Schema<IMedicalReport>({
  patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  reportType: { 
    type: String, 
    enum: ['Pathology', 'Imaging', 'Prescription', 'Other'], 
    default: 'Other' 
  },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IMedicalReport>('MedicalReport', medicalReportSchema);
