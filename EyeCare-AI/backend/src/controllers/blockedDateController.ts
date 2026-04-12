import { Request, Response } from 'express';
import BlockedDate from '../models/BlockedDate';

// @desc    Get blocked dates for a doctor
// @route   GET /api/doctors/:id/blocked-dates
export const getBlockedDates = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blocked = await BlockedDate.find({ doctor: id });
    res.json(blocked.map(b => b.date));
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

// @desc    Toggle a blocked date (block if not blocked, unblock if already blocked)
// @route   POST /api/availability/blocked-dates
export const toggleBlockedDate = async (req: any, res: Response) => {
  try {
    const { date } = req.body; // YYYY-MM-DD string
    const doctorId = req.user._id;

    if (!date) return res.status(400).json({ message: 'Date is required' });

    const existing = await BlockedDate.findOne({ doctor: doctorId, date });
    if (existing) {
      await existing.deleteOne();
      return res.json({ blocked: false, date });
    }

    await BlockedDate.create({ doctor: doctorId, date });
    res.status(201).json({ blocked: true, date });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
