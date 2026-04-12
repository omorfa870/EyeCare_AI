import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import User from '../models/User';
import Appointment from '../models/Appointment';

// @desc    Create Doctor Profile
// @route   POST /api/doctors
export const createDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;

    // 1. Validate User exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Validate Role
    if (existingUser.role !== 'doctor') {
      return res.status(400).json({ message: 'User is not registered as a doctor' });
    }

    // 3. Check for existing profile
    const profileExists = await Doctor.findOne({ user });
    if (profileExists) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    // 4. Create Profile (unapproved by default)
    const doctor = await Doctor.create({ ...req.body, isApproved: false, isActive: false });
    res.status(201).json(doctor);
  } catch (e: any) {
    res.status(400).json({ message: 'Error creating doctor profile', error: e.message });
  }
};

// @desc    Get All Approved & Active Doctors (public)
// @route   GET /api/doctors
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find({ isApproved: true })
      .populate('user', 'profile.firstName profile.lastName email');
    res.json(doctors);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Get Pending (unapproved) doctors — admin only
// @route   GET /api/admin/doctors/pending
export const getPendingDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find({ isApproved: false })
      .populate('user', 'profile.firstName profile.lastName email createdAt');
    res.json(doctors);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Approve a doctor signup request — admin only
// @route   PUT /api/admin/doctors/:id/approve
export const approveDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    doctor.isApproved = true;
    doctor.isActive = true;
    await doctor.save();
    res.json({ message: 'Doctor approved successfully', doctor });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const getDoctorStats = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) return res.status(400).json({ message: 'Doctor ID required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Patients Today
    const appointmentsToday = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
      status: { $ne: 'cancelled' }
    });

    // 2. Total Patients (All time unique)
    const distinctPatients = await Appointment.distinct('patient', {
      doctor: doctorId
    });
    const totalPatients = distinctPatients.length;

    // 3. Pending Requests
    const pendingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'pending'
    });

    // 4. Total Appointments (All time, excluding cancelled)
    const totalAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: { $ne: 'cancelled' }
    });

    res.json({
      appointmentsToday,
      totalPatients,
      pendingAppointments,
      totalAppointments
    });

  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Search Doctors by Specialization or Name
// @route   GET /api/doctors/search?query=...
export const searchDoctors = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchPattern = new RegExp(query, 'i');

    const doctorsBySpecialization = await Doctor.find({
      isApproved: true,
      isActive: true,
      specialization: searchPattern
    }).populate('user', 'profile.firstName profile.lastName email');

    const usersByName = await User.find({
      role: 'doctor',
      $or: [
        { 'profile.firstName': searchPattern },
        { 'profile.lastName': searchPattern }
      ]
    }).select('_id');

    const userIds = usersByName.map(u => u._id);
    const doctorsByName = await Doctor.find({
      isApproved: true,
      isActive: true,
      user: { $in: userIds }
    }).populate('user', 'profile.firstName profile.lastName email');

    const allDoctors = [...doctorsBySpecialization, ...doctorsByName];
    const uniqueDoctors = Array.from(
      new Map(allDoctors.map(doc => [doc._id.toString(), doc])).values()
    );

    res.json(uniqueDoctors);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Update Doctor Status (Active/Inactive)
// @route   PUT /api/doctors/:id
export const updateDoctorStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    doctor.isActive = isActive;
    await doctor.save();

    res.json(doctor);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
