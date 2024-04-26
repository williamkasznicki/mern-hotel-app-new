import express from 'express';
import { verifyToken } from '../middleware/auth';
import { deleteBooking, getMyBookings, cancelBooking } from '../controllers/myBookingController';

const router = express.Router();

router.get('/', verifyToken, getMyBookings);

router.put('/:bookingId/cancel', verifyToken, cancelBooking);

router.delete('/bookingId', verifyToken, deleteBooking);

export default router;
