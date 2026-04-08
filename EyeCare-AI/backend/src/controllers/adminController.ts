import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import Admin from '../models/Admin';
import Patient from '../models/Patient';

// @desc    Create Admin Profile
// @route   POST /api/admin/profile
export const createAdminProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, roleTitle } = req.body;
    
    // Ensure the user exists and is an admin
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(400).json({ message: 'User not valid or not an admin' });
    }

    const admin = await Admin.create({
      user: userId,
      roleTitle,
      permissions: req.body.permissions
    });

    res.status(201).json(admin);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Get System Stats (Dashboard)
// @route   GET /api/admin/stats
export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Counts
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    
    // 2. Financials (Mock calculation based on appointment count x avg fee)
    // Assuming avg visit fee is 500 BDT
    const estimatedRevenue = totalAppointments * 500; 

    // 3. Recent 5 Appointments (System-wide)
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('doctor', 'profile.firstName profile.lastName')
      .populate('patient', 'profile.firstName profile.lastName');

    // 4. Recent 5 Users Registered
    const newUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email role profile.firstName profile.lastName createdAt');

    res.json({
      counts: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        estimatedRevenue
      },
      recentActivity: {
        appointments: recentAppointments,
        newUsers: newUsers
      }
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};


// @desc    Get All Users
// @route   GET /api/admin/users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Delete User (Ban)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // In a real app, you would also delete their Profile, Appointments, etc.
    res.json({ message: 'User removed' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Get All Patients
// @route   GET /api/admin/patients
export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await Patient.find({})
      .populate('user', '-password')
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
