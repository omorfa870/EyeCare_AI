import { Request, Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Admin from '../models/Admin';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

// Fixed admin credentials - these are the only allowed admin accounts
const FIXED_ADMINS = [
  { email: 'admin0001@eye.com', password: '123456', firstName: 'Admin', lastName: 'One' },
  { email: 'admin0002@eye.com', password: '123456', firstName: 'Admin', lastName: 'Two' },
  { email: 'admin0003@eye.com', password: '123456', firstName: 'Admin', lastName: 'Three' },
];

// Seed fixed admin accounts on startup
export const seedAdmins = async () => {
  for (const admin of FIXED_ADMINS) {
    const exists = await User.findOne({ email: admin.email });
    if (!exists) {
      const user = await User.create({
        email: admin.email,
        password: admin.password,
        role: 'admin',
        profile: { firstName: admin.firstName, lastName: admin.lastName }
      });
      await Admin.create({
        user: user._id,
        roleTitle: 'Super Admin',
        permissions: {
          manageUsers: true,
          manageDoctors: true,
          manageHospitals: true,
          viewAnalytics: true,
        }
      });
      console.log(`Admin seeded: ${admin.email}`);
    }
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, role, firstName, lastName, specialization, registrationNumber } = req.body;
  try {
    // Block admin registration - admin accounts are fixed and pre-seeded
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created via registration.' });
    }

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
      // Doctors start as not approved and not active — admin must approve
      roleData = await Doctor.create({
        user: user._id,
        specialization,
        registrationNumber,
        qualifications: [],
        isActive: false,
        isApproved: false
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
      token: generateToken(user._id as unknown as string),
      // Signal to frontend that doctor must wait for approval
      pendingApproval: role === 'doctor' ? true : false
    });
  } catch (err: any) {
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
        // Block unapproved doctors from logging in
        if (!roleData || !roleData.isApproved) {
          return res.status(403).json({
            message: 'Your account is pending admin approval. Please wait for an administrator to approve your registration.'
          });
        }
      } else if (user.role === 'patient') {
        roleData = await Patient.findOne({ user: user._id });
      } else if (user.role === 'admin') {
        roleData = await Admin.findOne({ user: user._id });
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
