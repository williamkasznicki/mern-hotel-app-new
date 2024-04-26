import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import {
  authRoutes,
  userRoutes,
  myHotelRoutes,
  hotelRoutes,
  myBookingRoutes,
  roomRoutes,
  roomNumberRoutes,
  BookingRoutes,
  dashboardRoutes,
} from './routes';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connectMongoDB = async () => {
  try {
    console.log(process.env.MONGODB_CONNECTION_STRING)
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection error:', error);
  }
};

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/my-rooms', roomRoutes);
app.use('/api/bookings', BookingRoutes);
app.use('/api/my-hotels', myHotelRoutes);
app.use('/api/my-bookings', myBookingRoutes);
app.use('/api/my-roomNumbers', roomNumberRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch-all route for serving frontend
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong with server! Please try again later.');
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  connectMongoDB();
  console.log(`Server running on port ${PORT}`);
});
