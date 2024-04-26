import express from 'express';
import multer from 'multer';
import { body, param } from 'express-validator';
import { verifyToken } from '../middleware/auth';
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getHotelRooms,
  getRoomById,
  updateRoomNumberAvailability,
} from '../controllers/roomController';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.post(
  '/:hotelId',
  verifyToken,
  upload.array('imageFiles'),
  [
    body('roomType').notEmpty().withMessage('Room type is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('pricePerNight')
      .notEmpty()
      .isNumeric()
      .withMessage('Price per night is required and must be a number'),
    body('roomFacilities')
      .notEmpty()
      .isArray()
      .withMessage('Room facilities are required'),
    body('maxAdult')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum adults must be a positive integer'),
    body('maxChild')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Maximum children must be a non-negative integer'),
  ],
  createRoom
);

router.put(
  '/:roomId',
  verifyToken,
  upload.array('imageFiles'),
  [param('roomId').notEmpty().withMessage('Room ID is required')],
  updateRoom
);

router.delete(
  '/:roomId',
  verifyToken,
  [param('roomId').notEmpty().withMessage('Room ID is required')],
  deleteRoom
);

router.get(
  '/hotel/:hotelId',
  verifyToken,
  [param('hotelId').notEmpty().withMessage('Hotel ID is required')],
  getHotelRooms
);

router.get(
  '/:roomId',
  verifyToken,
  [param('roomId').notEmpty().withMessage('Room ID is required')],
  getRoomById
);

export default router;
