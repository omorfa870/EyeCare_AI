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
router.get('/doctors/:id/availability', authMiddleware_1.protect, appController_1.getDoctorAvailability);
// Params: { id } | Query: None | Body: { isActive }
router.put('/doctors/:id', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('admin', 'doctor'), doctorController_1.updateDoctorStatus);
// Params: None | Query: None | Body: { appointmentId, doctorId, patientId, medicines, ... }
router.post('/prescriptions', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), prescriptionController_1.createPrescription);
// Params: None | Query: { doctorId } | Body: None
router.get('/doctor/dashboard', authMiddleware_1.protect, (0, authMiddleware_1.authorize)('doctor'), doctorController_1.getDoctorStats);
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
/**
user
{
    "user": {
        "_id": "692fdbafc2c72d673a52df46",
        "email": "dr@eye.com",
        "role": "doctor",
        "profile": {
            "firstName": "Dr. Strange",
            "lastName": "Stephen"
        }
    },
    "roleData": {
        "_id": "692fdcc3c62b62bd961eead2",
        "user": "692fdbafc2c72d673a52df46",
        "specialization": "Neuro-Ophthalmology",
        "registrationNumber": "BMDC-9999",
        "qualifications": [
            "MBBS",
            "MD"
        ],
        "isActive": true,
        "createdAt": "2025-12-03T06:46:27.462Z",
        "updatedAt": "2025-12-03T06:46:27.462Z",
        "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmZkYmFmYzJjNzJkNjczYTUyZGY0NiIsImlhdCI6MTc2NDgyNDk3NSwiZXhwIjoxNzY3NDE2OTc1fQ.1QCJHvS_rHOhbJeiTbfRMJG18inszKnikr-jNnHQgZI"
}

{
    "user": {
        "_id": "692fde039f8edce91f20fbe1",
        "email": "ptn@eye.com",
        "role": "patient",
        "profile": {
            "firstName": "Mr.",
            "lastName": "XYZ"
        }
    },
    "roleData": {
        "_id": "692fde559f8edce91f20fbe7",
        "user": "692fde039f8edce91f20fbe1",
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "gender": "other",
        "allergies": [
            "Pollen",
            "Dust"
        ],
        "medicalHistory": [
            "Diabetic Type 2"
        ],
        "createdAt": "2025-12-03T06:53:09.742Z",
        "updatedAt": "2025-12-03T06:53:09.742Z",
        "__v": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmZkZTAzOWY4ZWRjZTkxZjIwZmJlMSIsImlhdCI6MTc2NDgyNTI1NCwiZXhwIjoxNzY3NDE3MjU0fQ.k19R-NSin9YzGyR-Ewqa6ScJ1PFnyDgrTit1y1MLVBk"
}
**/
