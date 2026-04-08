import { Request, Response } from 'express';
import User from '../models/User';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import EyeRecord from '../models/EyeRecord';
import Availability from '../models/Availability';
import Prescription from '../models/Prescription';

// --- PATIENT PROFILES ---

export const createPatientProfile = async (req: Request, res: Response) => {
  try {
    const { user, medicalHistory, allergies } = req.body;

    // 1. Validation
    const existingUser = await User.findById(user);
    if (!existingUser) return res.status(404).json({ message: 'User not found' });
    if (existingUser.role !== 'patient') return res.status(400).json({ message: 'User is not a patient' });
    
    const existingProfile = await Patient.findOne({ user });
    if (existingProfile) return res.status(400).json({ message: 'Profile already exists' });

    // 2. Create
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// --- APPOINTMENTS ---

// --- APPOINTMENTS WITH LOGIC ---
export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, date, reason, type } = req.body;
    const dat = new Date(date);
    const appointmentDate = new Date(dat + "Z");

    //0. Validate Type
    if (type && !['remote', 'physical'].includes(type)) {
      return res.status(400).json({ message: 'Invalid appointment type' });
    }

    // 1. Basic Validation
    const patientUser = await User.findById(patientId);
    const doctorUser = await User.findById(doctorId);
    if (!patientUser || !doctorUser) {
      return res.status(404).json({ message: 'Patient or Doctor not found' });
    }

    // 2. Day of Week Validation
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[appointmentDate.getUTCDay()]; // Use UTC day to match the input "Z" time

    const schedule = await Availability.findOne({ doctor: doctorId, dayOfWeek: dayName });

    console.log(schedule);
    
    if (!schedule) {
      return res.status(400).json({ 
        message: `Doctor is not available on ${dayName}s.` 
      });
    }

    // 3. Time Window Validation (FIXED for UTC)
    const requestHour = appointmentDate.getUTCHours();
    const requestMinute = appointmentDate.getUTCMinutes();

    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const requestTimeVal = (requestHour * 60) + requestMinute;
    const startTimeVal = (startHour * 60) + startMinute;
    const endTimeVal = (endHour * 60) + endMinute;

    if (requestTimeVal < startTimeVal || requestTimeVal >= endTimeVal) {
      return res.status(400).json({ 
        message: `Appointment time ${requestHour}:${requestMinute < 10 ? '0' + requestMinute : requestMinute} is outside working hours (${schedule.startTime} - ${schedule.endTime})` 
      });
    }

    // 4. Max Capacity Validation
    const startOfDay = new Date(appointmentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    if (existingCount >= schedule.maxPatients) {
      return res.status(400).json({ message: 'Doctor is fully booked for this day.' });
    }

    // 5. Double Booking Validation (Exact Match)
    const exactCollision = await Appointment.findOne({
      doctor: doctorId,
      date: { $eq: appointmentDate },
      status: { $ne: 'cancelled' }
    });

    if (exactCollision) {
      return res.status(400).json({ message: 'This time slot is already taken.' });
    }

    // 6. Create Appointment
    const appointmentData: any = {
      patient: patientId,
      doctor: doctorId,
      date: appointmentDate,
      reason,
      type: type || 'physical'
    };

    // Generate Google Meet link for remote appointments
    if (appointmentData.type === 'remote') {
      // Generate a mock Google Meet link
      const randomId = Math.random().toString(36).substring(2, 15);
      appointmentData.googleMeetLink = `https://meet.google.com/${randomId.slice(0, 3)}-${randomId.slice(3, 7)}-${randomId.slice(7, 10)}`;
    }

    const appointment = await Appointment.create(appointmentData);

    res.status(201).json(appointment);

  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// --- HELPER: Add Availability ---
// We need a controller function to SET the availability first!
export const setAvailability = async (req: Request, res: Response) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime, maxPatients } = req.body;

    // Use findOneAndUpdate with upsert (Update if exists, Create if new)
    const schedule = await Availability.findOneAndUpdate(
      { doctor: doctorId, dayOfWeek },
      { startTime, endTime, maxPatients },
      { new: true, upsert: true }
    );

    res.status(200).json(schedule);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const updateAvailability = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, maxPatients } = req.body;

    const availability = await Availability.findById(id);
    if (!availability) return res.status(404).json({ message: 'Availability not found' });

    // Authorization: Ensure doctor owns this slot
    // req.user is populated by authMiddleware
    if (availability.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this availability' });
    }

    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;
    if (maxPatients) availability.maxPatients = maxPatients;

    await availability.save();
    res.json(availability);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const getDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Doctor's User ID
    const availability = await Availability.find({ doctor: id });
    res.json(availability);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.query; // type = 'doctor' or 'patient'
    
    let query = {};
    if (type === 'doctor') query = { doctor: userId };
    else if (type === 'patient') query = { patient: userId };
    else return res.status(400).json({ message: 'Specify type (doctor/patient) and userId' });

    // Populate names for nice display
    const appointments = await Appointment.find(query)
      .populate('patient', 'profile.firstName profile.lastName')
      .populate('doctor', 'profile.firstName profile.lastName');

    res.json(appointments);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// --- FETCHING MEDICAL RECORDS ---

export const getPatientRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const records = await EyeRecord.find({ patient: patientId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body; // 'confirmed', 'cancelled'
    const { id } = req.params;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id, 
      { status },
      { new: true }
    );

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    res.json(appointment);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};


export const getPatientStats = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query; // Assuming passed as query param

    if (!patientId) return res.status(400).json({ message: 'Patient ID required' });

    // 1. Upcoming Appointment (The very next one)
    const upcomingAppointment = await Appointment.findOne({
      patient: patientId,
      date: { $gte: new Date() }, // Future dates only
      status: { $in: ['pending', 'confirmed'] }
    })
    .sort({ date: 1 }) // Soonest first
    .populate('doctor', 'profile.firstName profile.lastName specialization');

    // 2. Total Prescriptions
    // We need to import Prescription model at the top of appController if not already there
    // import Prescription from '../models/Prescription'; 
    const totalPrescriptions = await Prescription.countDocuments({ patient: patientId });

    // 3. Total AI Scans
    const totalScans = await EyeRecord.countDocuments({ patient: patientId });

    res.json({
      upcomingAppointment, // Returns null if none
      totalPrescriptions,
      totalScans
    });

  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// --- ADD GOOGLE MEET LINK ---
export const addGoogleMeetLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { googleMeetLink } = req.body;

    if (!googleMeetLink) {
      return res.status(400).json({ message: 'Google Meet link is required' });
    }

    // Validate URL format (basic check)
    if (!googleMeetLink.startsWith('https://meet.google.com/')) {
      return res.status(400).json({ message: 'Invalid Google Meet link format' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { googleMeetLink },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
