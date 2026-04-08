import { Request, Response } from 'express';
import Hospital from '../models/Hospital';
import Medicine from '../models/Medicine';

// --- HOSPITAL MANAGEMENT ---

export const createHospital = async (req: Request, res: Response) => {
  try {
    // Destructure to ensure we get specific fields including the new location
    const { 
      name, 
      branch, 
      address, 
      contactPhone, 
      email, 
      location // Expecting { latitude: number, longitude: number }
    } = req.body;

    // Basic Validation for Location
    if (location) {
      if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        return res.status(400).json({ message: 'Latitude and Longitude must be valid numbers' });
      }
    }

    const hospital = await Hospital.create({
      name,
      branch,
      address,
      contactPhone,
      email,
      location // Save the location object
    });

    res.status(201).json(hospital);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const getHospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await Hospital.find({ isActive: true });
    res.json(hospitals);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// --- MEDICINE DATABASE ---

export const addMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (e: any) {
    // Handle duplicate key error (e.g., if brandName + genericName constraint existed)
    if (e.code === 11000) {
      return res.status(400).json({ message: 'This medicine already exists.' });
    }
    res.status(400).json({ message: e.message });
  }
};

// Search API for Frontend Autocomplete
// GET /api/medicines?search=napa
export const searchMedicines = async (req: Request, res: Response) => {
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

    const medicines = await Medicine.find(query).limit(20);
    res.json(medicines);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
