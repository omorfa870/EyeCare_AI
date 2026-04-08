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
exports.getPatientReports = exports.uploadReport = void 0;
const MedicalReport_1 = __importDefault(require("../models/MedicalReport"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Upload a new medical report
// @route   POST /api/reports
const uploadReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { patientId, title, reportType } = req.body;
        // Validate Patient Exists
        const patient = yield User_1.default.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        // Save to DB
        const report = yield MedicalReport_1.default.create({
            patient: patientId,
            title: title || 'Untitled Report',
            reportType: reportType || 'Other',
            fileUrl: req.file.path, // Stores 'uploads/filename.pdf'
            fileType: req.file.mimetype
        });
        res.status(201).json({
            success: true,
            message: 'Report uploaded successfully',
            data: report
        });
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.uploadReport = uploadReport;
// @desc    Get all reports for a specific patient
// @route   GET /api/reports/:patientId
const getPatientReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId } = req.params;
        const reports = yield MedicalReport_1.default.find({ patient: patientId })
            .sort({ uploadedAt: -1 }); // Newest first
        res.json(reports);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getPatientReports = getPatientReports;
