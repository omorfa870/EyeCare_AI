import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    profileImage?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    profileImage: String
  }
}, { timestamps: true });

// FIX: Removed 'next' parameter. 
// With async/await in Mongoose, you just return void.
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidate: string) {
  return await bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
