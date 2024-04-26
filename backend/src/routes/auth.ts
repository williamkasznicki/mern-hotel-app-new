import express, { Request, Response } from 'express';
import { check } from 'express-validator';
import {
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/authController';
import { verifyEmail } from '../controllers/emailController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post(
  '/login',
  [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password with 6 or more characters required').isLength({
      min: 6,
    }),
  ],
  loginUser
);

router.post(
  '/register',
  [
    check('firstName', 'First Name is required').notEmpty(),
    check('lastName', 'Last Name is required').notEmpty(),
    check('email', 'Email is required').isEmail(),
    check('phone', 'Phone is required and max characters is 20')
      .notEmpty()
      .isLength({ max: 20 }),
    check('password', 'Password with 6 or more characters required').isLength({
      min: 6,
    }),
  ],
  registerUser
);

router.post('/logout', logoutUser);

router.get('/verify-email', verifyEmail);

router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).send({ userId: req.userId });
});



export default router;