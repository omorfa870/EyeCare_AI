import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db';
import User from '../models/User';
import Admin from '../models/Admin';

const FIXED_ADMINS = [
  { email: 'admin0001@eye.com', password: '123456', firstName: 'Admin', lastName: 'One' },
  { email: 'admin0002@eye.com', password: '123456', firstName: 'Admin', lastName: 'Two' },
  { email: 'admin0003@eye.com', password: '123456', firstName: 'Admin', lastName: 'Three' },
];

const run = async () => {
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const admin of FIXED_ADMINS) {
    const exists = await User.findOne({ email: admin.email });
    if (exists) {
      console.log(`  [skip]    ${admin.email} — already exists`);
      skipped++;
      continue;
    }

    const user = await User.create({
      email: admin.email,
      password: admin.password,
      role: 'admin',
      profile: { firstName: admin.firstName, lastName: admin.lastName },
    });

    await Admin.create({
      user: user._id,
      roleTitle: 'Super Admin',
      permissions: {
        manageUsers: true,
        manageDoctors: true,
        manageHospitals: true,
        viewAnalytics: true,
      },
    });

    console.log(`  [created] ${admin.email}`);
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped.`);
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
