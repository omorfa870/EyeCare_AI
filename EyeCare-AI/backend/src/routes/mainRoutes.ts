import express from 'express';
import { register, login } from '../controllers/authController';
import { createHospital, getHospitals, addMedicine, searchMedicines } from '../controllers/resourceController';
import { createPatientProfile, bookAppointment, getAppointments, getPatientRecords, setAvailability, updateAppointmentStatus, getPatientStats, addGoogleMeetLink, getDoctorAvailability, updateAvailability } from '../controllers/appController';
import { createPrescription, getPrescriptionById, getPatientPrescriptions } from '../controllers/prescriptionController';
import { analyzeEyeScan } from '../controllers/aiController';
import { createAdminProfile, getSystemStats, getAllUsers, deleteUser, getAllPatients } from '../controllers/adminController';
import { getBlockedDates, toggleBlockedDate } from '../controllers/blockedDateController';

// Middleware
import { protect, authorize } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import { createDoctorProfile, getDoctors, getDoctorStats, searchDoctors, updateDoctorStatus, getPendingDoctors, approveDoctor } from '../controllers/doctorController';
import { getPatientReports, uploadReport } from '../controllers/reportController';
import { updateProfile } from '../controllers/userController';

const router = express.Router();


// Params: None | Query: None | Body: { email, password, role, firstName, lastName }
router.post('/auth/register', register);
// Params: None | Query: None | Body: { email, password }
router.post('/auth/login', login);

// Params: None | Query: None | Body: { firstName, lastName, phone } | File: profileImage
router.put('/users/profile', protect, upload.single('profileImage'), updateProfile);

// Params: None | Query: None | Body: None
router.get('/hospitals', getHospitals);
// Params: None | Query: None | Body: None
router.get('/doctors', getDoctors);
// Params: None | Query: { query } | Body: None
router.get('/doctors/search', searchDoctors);

// 1. Patient & Doctor Shared
// Params: None | Query: { search } | Body: None
router.get('/medicines', protect, searchMedicines);
// Params: None | Query: { userId, type } | Body: None
router.get('/appointments', protect, getAppointments);
// Params: None | Query: None | Body: { patientId, doctorId } | File: scan
router.post('/ai/analyze', protect, upload.single('scan'), analyzeEyeScan);
// Params: { patientId } | Query: None | Body: None
router.get('/patients/:patientId/prescriptions', protect, getPatientPrescriptions);
// Params: { patientId } | Query: None | Body: None
router.get('/records/:patientId', protect, getPatientRecords);
// Params: { id } | Query: None | Body: None
router.get('/prescriptions/:id', protect, getPrescriptionById);
// Params: { patientId } | Query: None | Body: None
router.get('/reports/:patientId', protect, getPatientReports);

// 2. Patient Specific
// Params: None | Query: None | Body: { user, medicalHistory, allergies }
router.post('/patients', protect, authorize('patient'), createPatientProfile);
// Params: None | Query: None | Body: { patientId, doctorId, date, reason, type }
router.post('/appointments', protect, authorize('patient'), bookAppointment);
// Params: None | Query: { patientId } | Body: None
router.get('/patient/dashboard', protect, authorize('patient'), getPatientStats);
// Params: None | Query: None | Body: { patientId, title, reportType } | File: file
router.post('/reports', protect, authorize('patient'), upload.single('file'), uploadReport);

// 3. Doctor Specific
// Params: None | Query: None | Body: { user }
router.post('/doctors', protect, authorize('doctor'), createDoctorProfile);
// Params: None | Query: None | Body: { doctorId, dayOfWeek, startTime, endTime, maxPatients }
router.post('/availability', protect, authorize('doctor'), setAvailability);
// Params: { id } | Query: None | Body: { startTime, endTime, maxPatients }
router.put('/availability/:id', protect, authorize('doctor'), updateAvailability);
// Params: { id } | Query: None | Body: None
router.get('/doctors/:id/availability', getDoctorAvailability);
// Params: { id } | Query: None | Body: { isActive }
router.put('/doctors/:id', protect, authorize('admin', 'doctor'), updateDoctorStatus);
// Params: None | Query: None | Body: { appointmentId, doctorId, patientId, medicines, ... }
router.post('/prescriptions', protect, authorize('doctor'), createPrescription);
// Params: None | Query: { doctorId } | Body: None
router.get('/doctor/dashboard', protect, authorize('doctor'), getDoctorStats);

// Blocked dates for calendar
// Params: { id } | Query: None | Body: None — get blocked dates for a doctor
router.get('/doctors/:id/blocked-dates', getBlockedDates);
// Params: None | Body: { date } — toggle a blocked date (doctor only)
router.post('/availability/blocked-dates', protect, authorize('doctor'), toggleBlockedDate);

// 4. Admin Specific
// Params: None | Query: None | Body: { userId, roleTitle, permissions }
router.post('/admin/profile', protect, authorize('admin'), createAdminProfile);
// Params: None | Query: None | Body: None
router.get('/admin/stats', protect, authorize('admin'), getSystemStats);
// Params: None | Query: None | Body: None
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
// Params: None | Query: None | Body: None
router.get('/admin/patients', protect, authorize('admin'), getAllPatients);
// Params: { id } | Query: None | Body: None
router.delete('/admin/users/:id', protect, authorize('admin'), deleteUser);
// Params: None | Query: None | Body: None — get pending doctor approvals
router.get('/admin/doctors/pending', protect, authorize('admin'), getPendingDoctors);
// Params: { id } | Query: None | Body: None — approve a doctor
router.put('/admin/doctors/:id/approve', protect, authorize('admin'), approveDoctor);

// Admin Resources Management
// Params: None | Query: None | Body: { name, branch, address, contactPhone, email, location }
router.post('/hospitals', protect, authorize('admin'), createHospital);
// Params: None | Query: None | Body: { ...MedicineModelFields }
router.post('/medicines', protect, authorize('admin', 'doctor'), addMedicine);

// Params: { id } | Query: None | Body: { status }
router.put('/appointments/:id/status', protect, authorize('admin', 'doctor'), updateAppointmentStatus);

// Params: { id } | Query: None | Body: { googleMeetLink }
router.put('/appointments/:id/meet-link', protect, authorize('admin', 'doctor'), addGoogleMeetLink);

export default router;
