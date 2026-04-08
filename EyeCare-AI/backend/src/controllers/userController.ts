import { Request, Response } from 'express';
import User from '../models/User';

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phone) user.profile.phone = phone;

    if (req.file) {
      user.profile.profileImage = req.file.path; 
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
