import { Request, Response } from 'express';
import EyeRecord from '../models/EyeRecord';
import Doctor from '../models/Doctor';

// Helper function to map Condition -> Specialist Keywords
const getSpecialtyForCondition = (condition: string): string[] => {
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

export const analyzeEyeScan = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    
    const { patientId, doctorId } = req.body; // doctorId is optional (if patient uploads directly)

    // 1. Simulate AI Processing Delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

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
        if (result.severity === 'high') severityValue = 'severe';
        else if (result.severity === 'moderate') severityValue = 'moderate';
    }

    // 3. Find Relevant Doctors (The Recommendation Engine)
    const targetSpecialties = getSpecialtyForCondition(result.name);

    // 4. Create Medical Record
    const record = await EyeRecord.create({
      patient: patientId,
      doctor: doctorId || undefined,
      scanImage: req.file.filename,
      aiAnalysis: {
        detectedCondition: result.name,
        probability: Number(probability),
        severity: severityValue as 'low' | 'moderate' | 'severe',
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

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
