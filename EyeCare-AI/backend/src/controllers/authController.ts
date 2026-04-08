import { Request, Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, role, firstName, lastName, specialization, registrationNumber } = req.body;
  try {
    // 1. Validation
    if (role === 'doctor') {
      if (!specialization || !registrationNumber) {
        return res.status(400).json({ message: 'Specialization and Registration Number are required for doctors' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User exists' });

    // 2. Create User
    const user = await User.create({ 
      email, 
      password, 
      role, 
      profile: { firstName, lastName } 
    });

    // 3. Create Role Specific Doc
    let roleData = null;
    if (role === 'patient') {
      roleData = await Patient.create({
        user: user._id,
        allergies: [],
        medicalHistory: []
      });
    } else if (role === 'doctor') {
      roleData = await Doctor.create({
        user: user._id,
        specialization,
        registrationNumber,
        qualifications: [],
        isActive: true
      });
    }

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      roleData,
      token: generateToken(user._id as unknown as string)
    });
  } catch (err: any) {
    // Cleanup if role creation fails (optional but good practice)
    // await User.findByIdAndDelete(user._id); 
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await user.comparePassword(password))) {
      
      let roleData = null;
      if (user.role === 'doctor') {
        roleData = await Doctor.findOne({ user: user._id });
      } else if (user.role === 'patient') {
        roleData = await Patient.findOne({ user: user._id });
      }

      res.json({
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        roleData,
        token: generateToken(user._id as unknown as string)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
