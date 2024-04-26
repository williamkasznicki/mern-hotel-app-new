import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendVerificationEmail } from './emailController';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import jwt from 'jsonwebtoken';

export const loginUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.deleted_at) {
      return res.status(404).json({ message: 'Email does not exist!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong email or password!' });
    }

    const token = jwt.sign(
      { userId: user.id, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: '1d',
      }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
    });

    res.status(200).json({ userId: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });

    // Check if user already exists
    if (user && !user.deleted_at) {
      return res.status(400).json({ message: 'This email already exists' });
    }

    // Check if user is soft-deleted
    if (user && user.deleted_at) {
      const verificationToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '48h' } // Set the token expiration time to 48 hours
      );
      console.log(
        'debug vefificationToken: ',
        verificationToken,
        ' from authContoller'
      );
      const verificationLink = `http://localhost:${process.env.PORT}/api/auth/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(user.email, verificationLink);
      return res.status(200).send({
        message:
          'Verification email sent. Please check your email inbox or spam folder to restore your account.',
      });
    }

    // Create a new user if user doesn't exist
    if (!user) {
      user = new User(req.body);
      await user.save();

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: '1d',
        }
      );

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // if true the cookies will send over HTTPS only
        maxAge: 86400000, // 1 day
      });

      return res.status(200).send({ message: 'User registered successfully' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Something went wrong' });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.cookie('auth_token', '', {
    expires: new Date(0),
  });
  res.send({ message: 'Logged out successfully' });
};
