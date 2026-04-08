"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGoogleMeetLink = exports.getPatientStats = exports.updateAppointmentStatus = exports.getPatientRecords = exports.getAppointments = exports.getDoctorAvailability = exports.updateAvailability = exports.setAvailability = exports.bookAppointment = exports.createPatientProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const EyeRecord_1 = __importDefault(require("../models/EyeRecord"));
const Availability_1 = __importDefault(require("../models/Availability"));
const Prescription_1 = __importDefault(require("../models/Prescription"));
// --- PATIENT PROFILES ---
const createPatientProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, medicalHistory, allergies } = req.body;
        // 1. Validation
        const existingUser = yield User_1.default.findById(user);
        if (!existingUser)
            return res.status(404).json({ message: 'User not found' });
        if (existingUser.role !== 'patient')
            return res.status(400).json({ message: 'User is not a patient' });
        const existingProfile = yield Patient_1.default.findOne({ user });
        if (existingProfile)
            return res.status(400).json({ message: 'Profile already exists' });
        // 2. Create
        const patient = yield Patient_1.default.create(req.body);
        res.status(201).json(patient);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.createPatientProfile = createPatientProfile;
// --- APPOINTMENTS ---
// --- APPOINTMENTS WITH LOGIC ---
const bookAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId, doctorId, date, reason, type } = req.body;
        const dat = new Date(date);
        const appointmentDate = new Date(dat + "Z");
        //0. Validate Type
        if (type && !['remote', 'physical'].includes(type)) {
            return res.status(400).json({ message: 'Invalid appointment type' });
        }
        // 1. Basic Validation
        const patientUser = yield User_1.default.findById(patientId);
        const doctorUser = yield User_1.default.findById(doctorId);
        if (!patientUser || !doctorUser) {
            return res.status(404).json({ message: 'Patient or Doctor not found' });
        }
        // 2. Day of Week Validation
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[appointmentDate.getUTCDay()]; // Use UTC day to match the input "Z" time
        const schedule = yield Availability_1.default.findOne({ doctor: doctorId, dayOfWeek: dayName });
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
        const existingCount = yield Appointment_1.default.countDocuments({
            doctor: doctorId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'cancelled' }
        });
        if (existingCount >= schedule.maxPatients) {
            return res.status(400).json({ message: 'Doctor is fully booked for this day.' });
        }
        // 5. Double Booking Validation (Exact Match)
        const exactCollision = yield Appointment_1.default.findOne({
            doctor: doctorId,
            date: { $eq: appointmentDate },
            status: { $ne: 'cancelled' }
        });
        if (exactCollision) {
            return res.status(400).json({ message: 'This time slot is already taken.' });
        }
        // 6. Create Appointment
        const appointmentData = {
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
        const appointment = yield Appointment_1.default.create(appointmentData);
        res.status(201).json(appointment);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.bookAppointment = bookAppointment;
// --- HELPER: Add Availability ---
// We need a controller function to SET the availability first!
const setAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, dayOfWeek, startTime, endTime, maxPatients } = req.body;
        // Use findOneAndUpdate with upsert (Update if exists, Create if new)
        const schedule = yield Availability_1.default.findOneAndUpdate({ doctor: doctorId, dayOfWeek }, { startTime, endTime, maxPatients }, { new: true, upsert: true });
        res.status(200).json(schedule);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.setAvailability = setAvailability;
const updateAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { startTime, endTime, maxPatients } = req.body;
        const availability = yield Availability_1.default.findById(id);
        if (!availability)
            return res.status(404).json({ message: 'Availability not found' });
        // Authorization: Ensure doctor owns this slot
        // req.user is populated by authMiddleware
        if (availability.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this availability' });
        }
        if (startTime)
            availability.startTime = startTime;
        if (endTime)
            availability.endTime = endTime;
        if (maxPatients)
            availability.maxPatients = maxPatients;
        yield availability.save();
        res.json(availability);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.updateAvailability = updateAvailability;
const getDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Doctor's User ID
        const availability = yield Availability_1.default.find({ doctor: id });
        res.json(availability);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getDoctorAvailability = getDoctorAvailability;
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, type } = req.query; // type = 'doctor' or 'patient'
        let query = {};
        if (type === 'doctor')
            query = { doctor: userId };
        else if (type === 'patient')
            query = { patient: userId };
        else
            return res.status(400).json({ message: 'Specify type (doctor/patient) and userId' });
        // Populate names for nice display
        const appointments = yield Appointment_1.default.find(query)
            .populate('patient', 'profile.firstName profile.lastName')
            .populate('doctor', 'profile.firstName profile.lastName');
        res.json(appointments);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getAppointments = getAppointments;
// --- FETCHING MEDICAL RECORDS ---
const getPatientRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId } = req.params;
        const records = yield EyeRecord_1.default.find({ patient: patientId }).sort({ createdAt: -1 });
        res.json(records);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getPatientRecords = getPatientRecords;
const updateAppointmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body; // 'confirmed', 'cancelled'
        const { id } = req.params;
        if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status update' });
        }
        const appointment = yield Appointment_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!appointment)
            return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.updateAppointmentStatus = updateAppointmentStatus;
const getPatientStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId } = req.query; // Assuming passed as query param
        if (!patientId)
            return res.status(400).json({ message: 'Patient ID required' });
        // 1. Upcoming Appointment (The very next one)
        const upcomingAppointment = yield Appointment_1.default.findOne({
            patient: patientId,
            date: { $gte: new Date() }, // Future dates only
            status: { $in: ['pending', 'confirmed'] }
        })
            .sort({ date: 1 }) // Soonest first
            .populate('doctor', 'profile.firstName profile.lastName specialization');
        // 2. Total Prescriptions
        // We need to import Prescription model at the top of appController if not already there
        // import Prescription from '../models/Prescription'; 
        const totalPrescriptions = yield Prescription_1.default.countDocuments({ patient: patientId });
        // 3. Total AI Scans
        const totalScans = yield EyeRecord_1.default.countDocuments({ patient: patientId });
        res.json({
            upcomingAppointment, // Returns null if none
            totalPrescriptions,
            totalScans
        });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getPatientStats = getPatientStats;
// --- ADD GOOGLE MEET LINK ---
const addGoogleMeetLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const appointment = yield Appointment_1.default.findByIdAndUpdate(id, { googleMeetLink }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.addGoogleMeetLink = addGoogleMeetLink;
