import express from 'express';
import { register, login } from '../controllers/authController';
import { createHospital, getHospitals, addMedicine, searchMedicines } from '../controllers/resourceController';
import { createPatientProfile, bookAppointment, getAppointments, getPatientRecords, setAvailability, updateAppointmentStatus, getPatientStats, addGoogleMeetLink, getDoctorAvailability, updateAvailability } from '../controllers/appController';
import { createPrescription, getPrescriptionById, getPatientPrescriptions } from '../controllers/prescriptionController';
import { analyzeEyeScan } from '../controllers/aiController';
import { createAdminProfile, getSystemStats, getAllUsers, deleteUser, getAllPatients } from '../controllers/adminController';

// Middleware
import { protect, authorize } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import { createDoctorProfile, getDoctors, getDoctorStats, searchDoctors, updateDoctorStatus } from '../controllers/doctorController';
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
router.get('/doctors/:id/availability', protect, getDoctorAvailability);
// Params: { id } | Query: None | Body: { isActive }
router.put('/doctors/:id', protect, authorize('admin', 'doctor'), updateDoctorStatus);
// Params: None | Query: None | Body: { appointmentId, doctorId, patientId, medicines, ... }
router.post('/prescriptions', protect, authorize('doctor'), createPrescription);
// Params: None | Query: { doctorId } | Body: None
router.get('/doctor/dashboard', protect, authorize('doctor'), getDoctorStats);

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
