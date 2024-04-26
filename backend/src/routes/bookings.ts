import express from 'express';
import { verifyToken } from '../middleware/auth';
import { getBookingById } from '../controllers/bookingController';

const router = express.Router();

router.get('/:bookingId', verifyToken, getBookingById);


export default router;
