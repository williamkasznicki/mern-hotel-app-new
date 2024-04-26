import express from 'express';
import { body, param } from 'express-validator';
import { verifyToken, verifySuperAdmin } from '../middleware/auth';
import {
  getCurrentUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
} from '../controllers/usersController';

const router = express.Router();

router.get('/me', verifyToken, getCurrentUser);

router.put(
  '/me',
  verifyToken,
  [
    body('firstName').optional(),
    body('lastName').optional(),
    body('phone')
      .optional()
      .isLength({ max: 20 })
      .withMessage('Phone number must not exceed 12 characters'),
  ],
  updateUser
);

router.delete('/me', verifyToken, deleteUser);

router.get('/', verifyToken, verifySuperAdmin, getAllUsers);

router.get(
  '/:userId',
  verifyToken,
  verifySuperAdmin,
  [param('userId').notEmpty().withMessage('User ID is required')],
  getUserById
);

export default router;
