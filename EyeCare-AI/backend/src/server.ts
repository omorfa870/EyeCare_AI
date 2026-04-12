import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db';
import mainRoutes from './routes/mainRoutes';
import { seedAdmins } from './controllers/authController';

dotenv.config();

const startServer = async () => {
  await connectDB();
  await seedAdmins().catch(err => console.error('Admin seed error:', err));
};

startServer();

const app = express();
app.use(cors()); // Allow all temporarily to rule out origin mismatch
app.use(express.json());
app.use(morgan('dev'));

// Static Images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', mainRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
