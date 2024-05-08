import express from 'express';
import { verifySuperAdmin, verifyToken } from '../middleware/auth';
import { getAllUsers, getAllHotels, getAllBookings, getAllReviews, getAllRooms, getDashboardCounts } from '../controllers/adminController';


const router = express.Router();

router.get('/dashboard-counts', verifyToken, verifySuperAdmin, getDashboardCounts);
router.get('/users', verifyToken, verifySuperAdmin, getAllUsers);
router.get('/hotels', verifyToken, verifySuperAdmin, getAllHotels);
router.get('/rooms', verifyToken, verifySuperAdmin, getAllRooms);
router.get('/bookings', verifyToken, verifySuperAdmin, getAllBookings);
router.get('/reviews', verifyToken, verifySuperAdmin, getAllReviews);

export default router;
