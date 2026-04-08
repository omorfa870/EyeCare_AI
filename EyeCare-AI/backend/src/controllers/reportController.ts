import { Request, Response } from 'express';
import MedicalReport from '../models/MedicalReport';
import User from '../models/User';

// @desc    Upload a new medical report
// @route   POST /api/reports
export const uploadReport = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { patientId, title, reportType } = req.body;

    // Validate Patient Exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Save to DB
    const report = await MedicalReport.create({
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

  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Get all reports for a specific patient
// @route   GET /api/reports/:patientId
export const getPatientReports = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    const reports = await MedicalReport.find({ patient: patientId })
      .sort({ uploadedAt: -1 }); // Newest first

    res.json(reports);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
