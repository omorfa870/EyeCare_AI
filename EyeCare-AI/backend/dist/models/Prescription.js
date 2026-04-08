"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Sub-schema for individual line items
const prescriptionItemSchema = new mongoose_1.Schema({
    brandName: { type: String, required: true },
    genericName: { type: String, required: true },
    strength: { type: String, required: true },
    form: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g., "1+0+1"
    duration: { type: String, required: true }, // e.g., "7 days"
    instruction: { type: String } // e.g., "After meal"
}, { _id: false });
const prescriptionSchema = new mongoose_1.Schema({
    appointment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Appointment' },
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    vitals: {
        bp: String,
        weight: String,
        temperature: String
    },
    symptoms: [String],
    diagnosis: [String], // e.g., ["Myopia", "Conjunctivitis"]
    medicines: [prescriptionItemSchema],
    advice: { type: String }, // General advice like "Rest for 2 days"
    followUpDate: { type: Date }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Prescription', prescriptionSchema);
