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
exports.login = exports.register = exports.seedAdmins = void 0;
const User_1 = __importDefault(require("../models/User"));
const Doctor_1 = __importDefault(require("../models/Doctor"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Admin_1 = __importDefault(require("../models/Admin"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
// Fixed admin credentials - these are the only allowed admin accounts
const FIXED_ADMINS = [
    { email: 'admin0001@eye.com', password: '123456', firstName: 'Admin', lastName: 'One' },
    { email: 'admin0002@eye.com', password: '123456', firstName: 'Admin', lastName: 'Two' },
    { email: 'admin0003@eye.com', password: '123456', firstName: 'Admin', lastName: 'Three' },
];
// Seed fixed admin accounts on startup
const seedAdmins = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const admin of FIXED_ADMINS) {
        const exists = yield User_1.default.findOne({ email: admin.email });
        if (!exists) {
            const user = yield User_1.default.create({
                email: admin.email,
                password: admin.password,
                role: 'admin',
                profile: { firstName: admin.firstName, lastName: admin.lastName }
            });
            yield Admin_1.default.create({
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
});
exports.seedAdmins = seedAdmins;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const userExists = yield User_1.default.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: 'User exists' });
        // 2. Create User
        const user = yield User_1.default.create({
            email,
            password,
            role,
            profile: { firstName, lastName }
        });
        // 3. Create Role Specific Doc
        let roleData = null;
        if (role === 'patient') {
            roleData = yield Patient_1.default.create({
                user: user._id,
                allergies: [],
                medicalHistory: []
            });
        }
        else if (role === 'doctor') {
            // Doctors start as not approved and not active — admin must approve
            roleData = yield Doctor_1.default.create({
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
            token: generateToken(user._id),
            // Signal to frontend that doctor must wait for approval
            pendingApproval: role === 'doctor' ? true : false
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email }).select('+password');
        if (user && (yield user.comparePassword(password))) {
            let roleData = null;
            if (user.role === 'doctor') {
                roleData = yield Doctor_1.default.findOne({ user: user._id });
                // Block unapproved doctors from logging in
                if (!roleData || !roleData.isApproved) {
                    return res.status(403).json({
                        message: 'Your account is pending admin approval. Please wait for an administrator to approve your registration.'
                    });
                }
            }
            else if (user.role === 'patient') {
                roleData = yield Patient_1.default.findOne({ user: user._id });
            }
            else if (user.role === 'admin') {
                roleData = yield Admin_1.default.findOne({ user: user._id });
            }
            res.json({
                user: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile
                },
                roleData,
                token: generateToken(user._id)
            });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.login = login;
