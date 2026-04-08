import { Request, Response } from 'express';
import Prescription from '../models/Prescription';
import Appointment from '../models/Appointment';

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const { appointmentId, doctorId, patientId, medicines, ...otherData } = req.body;

    console.log(medicines);

    // Create the prescription
    const prescription = await Prescription.create({
      appointment: appointmentId,
      doctor: doctorId,
      patient: patientId,
      medicines,
      ...otherData
    });

    // If linked to an appointment, mark it as completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    }

    res.status(201).json(prescription);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor', 'profile.firstName profile.lastName specialization')
      .populate('patient', 'profile.firstName profile.lastName profile.age')
      
    if (!prescription) return res.status(404).json({ message: 'Not Found' });
    
    res.json(prescription);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const list = await Prescription.find({ patient: patientId })
      .sort({ date: -1 })
      .populate('doctor', 'profile.firstName profile.lastName');
    
    res.json(list);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
