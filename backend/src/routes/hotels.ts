import express from 'express';
import { param } from 'express-validator';
import { verifyToken } from '../middleware/auth';
import {
  getAllHotels,
  getHotelById,
  searchHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelsController';
import {
  createBooking,
  createPaymentIntent,
} from '../controllers/myBookingController';
import {
  getMyAvailableRooms,
} from '../controllers/roomController';

import {
  getHotelReviews,
  createReview,
  deleteReview,
  updateReview,
} from '../controllers/reviewController';


const router = express.Router();

router.get('/search', searchHotels);
router.get('/', getAllHotels);
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Hotel ID is required')],
  getHotelById
);

router.post('/', verifyToken, createHotel);
router.put(
  '/:id',
  verifyToken,
  [param('id').notEmpty().withMessage('Hotel ID is required')],
  updateHotel
);
router.delete(
  '/:id',
  verifyToken,
  [param('id').notEmpty().withMessage('Hotel ID is required')],
  deleteHotel
);

router.post(
  '/:hotelId/bookings/payment-intent',
  verifyToken,
  createPaymentIntent
);
router.post('/:hotelId/bookings', verifyToken, createBooking);

router.get('/:hotelId/reviews', getHotelReviews);

router.post('/:hotelId/add-review', verifyToken, createReview);

router.put('/:reviewId/update', verifyToken, updateReview);

router.delete('/:reviewId/delete', verifyToken, deleteReview);

router.get('/:hotelId/available-rooms', getMyAvailableRooms);

export default router;
