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
exports.updateDoctorStatus = exports.searchDoctors = exports.getDoctorStats = exports.approveDoctor = exports.getPendingDoctors = exports.getDoctors = exports.createDoctorProfile = void 0;
const Doctor_1 = __importDefault(require("../models/Doctor"));
const User_1 = __importDefault(require("../models/User"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
// @desc    Create Doctor Profile
// @route   POST /api/doctors
const createDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.body;
        // 1. Validate User exists
        const existingUser = yield User_1.default.findById(user);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // 2. Validate Role
        if (existingUser.role !== 'doctor') {
            return res.status(400).json({ message: 'User is not registered as a doctor' });
        }
        // 3. Check for existing profile
        const profileExists = yield Doctor_1.default.findOne({ user });
        if (profileExists) {
            return res.status(400).json({ message: 'Doctor profile already exists' });
        }
        // 4. Create Profile (unapproved by default)
        const doctor = yield Doctor_1.default.create(Object.assign(Object.assign({}, req.body), { isApproved: false, isActive: false }));
        res.status(201).json(doctor);
    }
    catch (e) {
        res.status(400).json({ message: 'Error creating doctor profile', error: e.message });
    }
});
exports.createDoctorProfile = createDoctorProfile;
// @desc    Get All Approved & Active Doctors (public)
// @route   GET /api/doctors
const getDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield Doctor_1.default.find({ isApproved: true })
            .populate('user', 'profile.firstName profile.lastName email');
        res.json(doctors);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getDoctors = getDoctors;
// @desc    Get Pending (unapproved) doctors — admin only
// @route   GET /api/admin/doctors/pending
const getPendingDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield Doctor_1.default.find({ isApproved: false })
            .populate('user', 'profile.firstName profile.lastName email createdAt');
        res.json(doctors);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getPendingDoctors = getPendingDoctors;
// @desc    Approve a doctor signup request — admin only
// @route   PUT /api/admin/doctors/:id/approve
const approveDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const doctor = yield Doctor_1.default.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        doctor.isApproved = true;
        doctor.isActive = true;
        yield doctor.save();
        res.json({ message: 'Doctor approved successfully', doctor });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.approveDoctor = approveDoctor;
const getDoctorStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.query;
        if (!doctorId)
            return res.status(400).json({ message: 'Doctor ID required' });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // 1. Patients Today
        const appointmentsToday = yield Appointment_1.default.countDocuments({
            doctor: doctorId,
            date: { $gte: today, $lt: tomorrow },
            status: { $ne: 'cancelled' }
        });
        // 2. Total Patients (All time unique)
        const distinctPatients = yield Appointment_1.default.distinct('patient', {
            doctor: doctorId
        });
        const totalPatients = distinctPatients.length;
        // 3. Pending Requests
        const pendingAppointments = yield Appointment_1.default.countDocuments({
            doctor: doctorId,
            status: 'pending'
        });
        // 4. Total Appointments (All time, excluding cancelled)
        const totalAppointments = yield Appointment_1.default.countDocuments({
            doctor: doctorId,
            status: { $ne: 'cancelled' }
        });
        res.json({
            appointmentsToday,
            totalPatients,
            pendingAppointments,
            totalAppointments
        });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getDoctorStats = getDoctorStats;
// @desc    Search Doctors by Specialization or Name
// @route   GET /api/doctors/search?query=...
const searchDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const searchPattern = new RegExp(query, 'i');
        const doctorsBySpecialization = yield Doctor_1.default.find({
            isApproved: true,
            isActive: true,
            specialization: searchPattern
        }).populate('user', 'profile.firstName profile.lastName email');
        const usersByName = yield User_1.default.find({
            role: 'doctor',
            $or: [
                { 'profile.firstName': searchPattern },
                { 'profile.lastName': searchPattern }
            ]
        }).select('_id');
        const userIds = usersByName.map(u => u._id);
        const doctorsByName = yield Doctor_1.default.find({
            isApproved: true,
            isActive: true,
            user: { $in: userIds }
        }).populate('user', 'profile.firstName profile.lastName email');
        const allDoctors = [...doctorsBySpecialization, ...doctorsByName];
        const uniqueDoctors = Array.from(new Map(allDoctors.map(doc => [doc._id.toString(), doc])).values());
        res.json(uniqueDoctors);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.searchDoctors = searchDoctors;
// @desc    Update Doctor Status (Active/Inactive)
// @route   PUT /api/doctors/:id
const updateDoctorStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }
        const doctor = yield Doctor_1.default.findById(id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        if (req.user.role !== 'admin' && doctor.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }
        doctor.isActive = isActive;
        yield doctor.save();
        res.json(doctor);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.updateDoctorStatus = updateDoctorStatus;
