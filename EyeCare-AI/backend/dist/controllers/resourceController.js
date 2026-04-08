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
exports.searchMedicines = exports.addMedicine = exports.getHospitals = exports.createHospital = void 0;
const Hospital_1 = __importDefault(require("../models/Hospital"));
const Medicine_1 = __importDefault(require("../models/Medicine"));
// --- HOSPITAL MANAGEMENT ---
const createHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Destructure to ensure we get specific fields including the new location
        const { name, branch, address, contactPhone, email, location // Expecting { latitude: number, longitude: number }
         } = req.body;
        // Basic Validation for Location
        if (location) {
            if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
                return res.status(400).json({ message: 'Latitude and Longitude must be valid numbers' });
            }
        }
        const hospital = yield Hospital_1.default.create({
            name,
            branch,
            address,
            contactPhone,
            email,
            location // Save the location object
        });
        res.status(201).json(hospital);
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }
});
exports.createHospital = createHospital;
const getHospitals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hospitals = yield Hospital_1.default.find({ isActive: true });
        res.json(hospitals);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.getHospitals = getHospitals;
// --- MEDICINE DATABASE ---
const addMedicine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const medicine = yield Medicine_1.default.create(req.body);
        res.status(201).json(medicine);
    }
    catch (e) {
        // Handle duplicate key error (e.g., if brandName + genericName constraint existed)
        if (e.code === 11000) {
            return res.status(400).json({ message: 'This medicine already exists.' });
        }
        res.status(400).json({ message: e.message });
    }
});
exports.addMedicine = addMedicine;
// Search API for Frontend Autocomplete
// GET /api/medicines?search=napa
const searchMedicines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            // Case-insensitive regex search
            query = {
                $or: [
                    { brandName: { $regex: search, $options: 'i' } },
                    { genericName: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const medicines = yield Medicine_1.default.find(query).limit(20);
        res.json(medicines);
    }
    catch (e) {
        res.status(500).json({ message: e.message });
    }
});
exports.searchMedicines = searchMedicines;
