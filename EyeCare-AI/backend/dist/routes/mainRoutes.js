"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const resourceController_1 = require("../controllers/resourceController");
const appController_1 = require("../controllers/appController");
const prescriptionController_1 = require("../controllers/prescriptionController");
const aiController_1 = require("../controllers/aiController");
const adminController_1 = require("../controllers/adminController");
const blockedDateController_1 = require("../controllers/blockedDateController");
// Middleware
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const doctorController_1 = require("../controllers/doctorController");
const reportController_1 = require("../controllers/reportController");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// Params: None | Query: None | Body: { email, password, role, firstName, lastName }
router.post('/auth/register', authController_1.register);
// Params: None | Query: None | Body: { email, password }
router.post('/auth/login', authController_1.login);
// Params: None | Query: None | Body: { firstName, lastName, phone } | File: profileImage
router.put('/users/profile', authMiddleware_1.protect, uploadMiddleware_1.upload.single('profileImage'), userController_1.updateProfile);
// Params: None | Query: None | Body: None
router.get('/hospitals', resourceController_1.getHospitals);
// Params: None | Query: None | Body: None
router.get('/doctors', doctorController_1.getDoctors);
// Params: None | Query: { query } | Body: None
router.get('/doctors/search', doctorController_1.searchDoctors);
// 1. Patient & Doctor Shared
// Params: None | Query: { search } | Body: None
router.get('/medicines', authMiddleware_1.protect, resourceController_1.searchMedicines);
// Params: None | Query: { userId, type } | Body: None
router.get('/appointments', authMiddleware_1.protect, appController_1.getAppointments);
// Params: None | Query: None | Body: { patientId, doctorId } | File: scan
router.post('/ai/analyze', authMiddleware_1.protect, uploadMiddleware_1.upload.single('scan'), aiController_1.analyzeEyeScan);
// Params: { patientId } | Query: None | Body: None
router.get('/patients/:patientId/prescriptions', authMiddleware_1.protect, prescriptionController_1.getPatientPrescriptions);
// Params: { patientId } | Query: None | Body: None
router.get('/records/:patientId', authMiddleware_1.protect, appController_1.getPatientRecords);
// Params: { id } | Query: None | Body: None
router.get('/prescriptions/:id', authMiddleware_1.protect, prescriptionController_1.getPrescriptionById);
// Params: { patientId } | Query: None | Body: None
router.get('/reports/:patientId', authMiddleware_1.protect, reportController_1.getPatientReports);
// 2. Patient Specific
// Params: None | Query: None | Body: { user, medicalHistory, allergies }
router.post('/patients', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('patient'), appController_1.createPatientProfile);
// Params: None | Query: None | Body: { patientId, doctorId, date, reason, type }
router.post('/appointments', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('patient'), appController_1.bookAppointment);
// Params: None | Query: { patientId } | Body: None
router.get('/patient/dashboard', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('patient'), appController_1.getPatientStats);
// Params: None | Query: None | Body: { patientId, title, reportType } | File: file
router.post('/reports', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('patient'), uploadMiddleware_1.upload.single('file'), reportController_1.uploadReport);
// 3. Doctor Specific
// Params: None | Query: None | Body: { user }
router.post('/doctors', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), doctorController_1.createDoctorProfile);
// Params: None | Query: None | Body: { doctorId, dayOfWeek, startTime, endTime, maxPatients }
router.post('/availability', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), appController_1.setAvailability);
// Params: { id } | Query: None | Body: { startTime, endTime, maxPatients }
router.put('/availability/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), appController_1.updateAvailability);
// Params: { id } | Query: None | Body: None
router.get('/doctors/:id/availability', appController_1.getDoctorAvailability);
// Params: { id } | Query: None | Body: { isActive }
router.put('/doctors/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'doctor'), doctorController_1.updateDoctorStatus);
// Params: None | Query: None | Body: { appointmentId, doctorId, patientId, medicines, ... }
router.post('/prescriptions', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), prescriptionController_1.createPrescription);
// Params: None | Query: { doctorId } | Body: None
router.get('/doctor/dashboard', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), doctorController_1.getDoctorStats);
// Blocked dates for calendar
// Params: { id } | Query: None | Body: None — get blocked dates for a doctor
router.get('/doctors/:id/blocked-dates', blockedDateController_1.getBlockedDates);
// Params: None | Body: { date } — toggle a blocked date (doctor only)
router.post('/availability/blocked-dates', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), blockedDateController_1.toggleBlockedDate);
// 4. Admin Specific
// Params: None | Query: None | Body: { userId, roleTitle, permissions }
router.post('/admin/profile', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), adminController_1.createAdminProfile);
// Params: None | Query: None | Body: None
router.get('/admin/stats', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), adminController_1.getSystemStats);
// Params: None | Query: None | Body: None
router.get('/admin/users', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), adminController_1.getAllUsers);
// Params: None | Query: None | Body: None
router.get('/admin/patients', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), adminController_1.getAllPatients);
// Params: { id } | Query: None | Body: None
router.delete('/admin/users/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), adminController_1.deleteUser);
// Params: None | Query: None | Body: None — get pending doctor approvals
router.get('/admin/doctors/pending', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), doctorController_1.getPendingDoctors);
// Params: { id } | Query: None | Body: None — approve a doctor
router.put('/admin/doctors/:id/approve', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), doctorController_1.approveDoctor);
// Admin Resources Management
// Params: None | Query: None | Body: { name, branch, address, contactPhone, email, location }
router.post('/hospitals', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin'), resourceController_1.createHospital);
// Params: None | Query: None | Body: { ...MedicineModelFields }
router.post('/medicines', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'doctor'), resourceController_1.addMedicine);
// Params: { id } | Query: None | Body: { status }
router.put('/appointments/:id/status', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'doctor'), appController_1.updateAppointmentStatus);
// Params: { id } | Query: None | Body: { googleMeetLink }
router.put('/appointments/:id/meet-link', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'doctor'), appController_1.addGoogleMeetLink);
exports.default = router;
