import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/auth';
import { body, param } from 'express-validator';
import {
  createHotel,
  getHotels,
  getHotelById,
  getMyHotelBookings,
  updateHotel,
  deleteHotel,
} from '../controllers/myHotelController';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const landmarksValidator = (value: any) => {
  // Check if the value is an object and has at least one property
  if (typeof value === 'object' && Object.keys(value).length > 0) {
    return true;
  }
  // If not, return false
  return false;
};

const validateLandmarks = [
  body('landmarks')
    .custom(landmarksValidator)
    .withMessage('At least one landmark is required')
] as any;

router.post(
  '/',
  verifyToken,
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('imageFiles', 6)(req, res, function (err: any) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large, Maximum size is 5 mb!' });
      }
      next(); // Continue to next middleware
    });
  },
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').notEmpty().withMessage('Hotel type is required'),
    body('address').notEmpty().withMessage('Address is required'),
    validateLandmarks,
    body('coordinate')
      .isArray({ min: 2, max: 2 })
      .withMessage('Coordinate must be an array of two elements'),
      body('coordinate.*')
      .optional(),
    body('imageUrls.*')
      .notEmpty()
      .withMessage('Image URL cannot be empty'),
    body('room')
      .optional()
      .isArray()
      .withMessage('Room must be an array'),
    body('review')
      .optional()
      .isArray()
      .withMessage('Review must be an array'),
    body('bookings')
      .optional()
      .isArray()
      .withMessage('Bookings must be an array'),
  ],
  createHotel
);

router.get('/', verifyToken, getHotels);

router.get(
  '/:id',
  verifyToken,
  [param('id').notEmpty().withMessage('Hotel ID is required')],
  getHotelById
);

router.get(
  '/:hotelId/bookings',
  verifyToken,
  [param('hotelId').notEmpty().withMessage('Hotel ID is required')],
  getMyHotelBookings
);



router.put(
  '/:hotelId',
  verifyToken,
  [param('hotelId').notEmpty().withMessage('Hotel ID is required')],
  upload.array('imageFiles'),
  updateHotel
);

router.delete(
  '/:hotelId',
  verifyToken,
  [param('hotelId').notEmpty().withMessage('Hotel ID is required')],
  deleteHotel
);

// handle Multer errors
export const handleMulterError = (
  err: multer.MulterError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.locals.fileTooLarge = true; // Set fileTooLarge in res.locals
      return res.status(400).json({ message: 'File size too large' });
    }
  }
  next(err);
};

// Add the error handling middleware to the router
router.use(handleMulterError);

export default router;
