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
exports.analyzeEyeScan = void 0;
const EyeRecord_1 = __importDefault(require("../models/EyeRecord"));
// Helper function to map Condition -> Specialist Keywords
const getSpecialtyForCondition = (condition) => {
    switch (condition) {
        case 'Diabetic Retinopathy':
        case 'Macular Edema':
            return ['Retina', 'Vitreoretinal', 'Ophthalmologist'];
        case 'Glaucoma':
            return ['Glaucoma', 'Ophthalmologist'];
        case 'Cataract':
            return ['Cataract', 'Cornea', 'Ophthalmologist'];
        case 'Healthy':
            return ['Ophthalmologist', 'General']; // Routine checkup
        default:
            return ['Ophthalmologist'];
    }
};
const analyzeEyeScan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: 'No image uploaded' });
        const { patientId, doctorId } = req.body; // doctorId is optional (if patient uploads directly)
        // 1. Simulate AI Processing Delay
        yield new Promise((resolve) => setTimeout(resolve, 1500));
        // 2. Mock AI Diagnosis Logic
        const conditions = [
            { name: 'Diabetic Retinopathy', severity: 'moderate' },
            { name: 'Glaucoma', severity: 'high' },
            { name: 'Cataract', severity: 'low' },
            { name: 'Healthy', severity: 'low' }
        ];
        const result = conditions[Math.floor(Math.random() * conditions.length)];
        const probability = (0.85 + Math.random() * 0.14).toFixed(2);
        let severityValue = 'low';
        if (result.name !== 'Healthy') {
            if (result.severity === 'high')
                severityValue = 'severe';
            else if (result.severity === 'moderate')
                severityValue = 'moderate';
        }
        // 3. Find Relevant Doctors (The Recommendation Engine)
        const targetSpecialties = getSpecialtyForCondition(result.name);
        // 4. Create Medical Record
        const record = yield EyeRecord_1.default.create({
            patient: patientId,
            doctor: doctorId || undefined,
            scanImage: req.file.filename,
            aiAnalysis: {
                detectedCondition: result.name,
                probability: Number(probability),
                severity: severityValue,
                notes: `Automated AI analysis suggests ${result.name}. Recommended consultation with ${targetSpecialties[0]} specialist.`
            },
            visualAcuity: { od: 'N/A', os: 'N/A' }
        });
        // 5. Return Analysis + Doctor Suggestions
        res.status(200).json({
            success: true,
            message: "AI Analysis Complete",
            data: {
                analysis: record
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.analyzeEyeScan = analyzeEyeScan;
