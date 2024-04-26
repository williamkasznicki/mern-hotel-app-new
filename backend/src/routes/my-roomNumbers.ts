import express from 'express';
import { body, param } from 'express-validator';
import { verifyToken } from '../middleware/auth';
import {
  createRoomNumber,
  updateRoomNumber,
  deleteRoomNumber,
  getRoomNumbersOfRoom,
  getRoomNumberById,
  updateRoomNumberOutOfService,
} from '../controllers/roomNumberController';

const router = express.Router();

router.post(
  '/:roomId',
  verifyToken,
  [
    body('roomNumberName').notEmpty().withMessage('Room number name is required'),
    body('unavailableDates')
      .optional()
      .isArray()
      .withMessage('Unavailable dates must be an array'),
  ],
  createRoomNumber
);

router.put(
  '/:roomNumberId',
  verifyToken,
  [param('roomNumberId').notEmpty().withMessage('Room number ID is required')],
  updateRoomNumber
);

router.put(
  '/:roomId/:roomNumberId/out-of-service',
  verifyToken,
  [param('roomNumberId').notEmpty().withMessage('Room number ID is required')],
  [param('roomId').notEmpty().withMessage('Room ID is required')],
  updateRoomNumberOutOfService
);

router.delete(
  '/:roomId/:roomNumberId',
  verifyToken,
  [param('roomNumberId').notEmpty().withMessage('Room number ID is required')],
  deleteRoomNumber
);

router.get(
  '/room/:roomId',
  verifyToken,
  [param('roomId').notEmpty().withMessage('Room ID is required')],
  getRoomNumbersOfRoom
);

router.get(
  '/:roomNumberId',
  verifyToken,
  [param('roomNumberId').notEmpty().withMessage('Room number ID is required')],
  getRoomNumberById
);

export default router;
