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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientPrescriptions = exports.getPrescriptionById = exports.createPrescription = void 0;
const Prescription_1 = __importDefault(require("../models/Prescription"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const createPrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { appointmentId, doctorId, patientId, medicines } = _a, otherData = __rest(_a, ["appointmentId", "doctorId", "patientId", "medicines"]);
        console.log(medicines);
        // Create the prescription
        const prescription = yield Prescription_1.default.create(Object.assign({ appointment: appointmentId, doctor: doctorId, patient: patientId, medicines }, otherData));
        // If linked to an appointment, mark it as completed
        if (appointmentId) {
            yield Appointment_1.default.findByIdAndUpdate(appointmentId, { status: 'completed' });
        }
        res.status(201).json(prescription);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.createPrescription = createPrescription;
const getPrescriptionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prescription = yield Prescription_1.default.findById(req.params.id)
            .populate('doctor', 'profile.firstName profile.lastName specialization')
            .populate('patient', 'profile.firstName profile.lastName profile.age');
        if (!prescription)
            return res.status(404).json({ message: 'Not Found' });
        res.json(prescription);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getPrescriptionById = getPrescriptionById;
const getPatientPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId } = req.params;
        const list = yield Prescription_1.default.find({ patient: patientId })
            .sort({ date: -1 })
            .populate('doctor', 'profile.firstName profile.lastName');
        res.json(list);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getPatientPrescriptions = getPatientPrescriptions;
