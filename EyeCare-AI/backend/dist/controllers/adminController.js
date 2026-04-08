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
exports.getAllPatients = exports.deleteUser = exports.getAllUsers = exports.getSystemStats = exports.createAdminProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Admin_1 = __importDefault(require("../models/Admin"));
const Patient_1 = __importDefault(require("../models/Patient"));
// @desc    Create Admin Profile
// @route   POST /api/admin/profile
const createAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, roleTitle } = req.body;
        // Ensure the user exists and is an admin
        const user = yield User_1.default.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(400).json({ message: 'User not valid or not an admin' });
        }
        const admin = yield Admin_1.default.create({
            user: userId,
            roleTitle,
            permissions: req.body.permissions
        });
        res.status(201).json(admin);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.createAdminProfile = createAdminProfile;
// @desc    Get System Stats (Dashboard)
// @route   GET /api/admin/stats
const getSystemStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Counts
        const totalPatients = yield User_1.default.countDocuments({ role: 'patient' });
        const totalDoctors = yield User_1.default.countDocuments({ role: 'doctor' });
        const totalAppointments = yield Appointment_1.default.countDocuments();
        // 2. Financials (Mock calculation based on appointment count x avg fee)
        // Assuming avg visit fee is 500 BDT
        const estimatedRevenue = totalAppointments * 500;
        // 3. Recent 5 Appointments (System-wide)
        const recentAppointments = yield Appointment_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('doctor', 'profile.firstName profile.lastName')
            .populate('patient', 'profile.firstName profile.lastName');
        // 4. Recent 5 Users Registered
        const newUsers = yield User_1.default.find()
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
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getSystemStats = getSystemStats;
// @desc    Get All Users
// @route   GET /api/admin/users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({}).select('-password');
        res.json(users);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getAllUsers = getAllUsers;
// @desc    Delete User (Ban)
// @route   DELETE /api/admin/users/:id
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield User_1.default.findByIdAndDelete(req.params.id);
        // In a real app, you would also delete their Profile, Appointments, etc.
        res.json({ message: 'User removed' });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.deleteUser = deleteUser;
// @desc    Get All Patients
// @route   GET /api/admin/patients
const getAllPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patients = yield Patient_1.default.find({})
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json(patients);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getAllPatients = getAllPatients;
