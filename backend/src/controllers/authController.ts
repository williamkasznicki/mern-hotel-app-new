import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendVerificationEmail } from './emailController';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

interface JwtPayload {
  userId: string;
  email: string;
  decoded: string;
  exp: number;
}

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
      const verificationLink = `http://localhost:${process.env.BACKEND_PORT}/api/auth/verify-email?token=${verificationToken}`;
      console.log(verificationLink);
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
    res.status(500).send({ message: 'Server internal error' });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  res.cookie('auth_token', '', {
    expires: new Date(0),
  });
  res.send({ message: 'Logged out successfully' });
};

export const getResetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    // Check if token exists
    if (!token) {
      return res.status(400).json({
        message: 'Reset token is missing, please try again later',
      });
    }

    // Verify and decode the JWT token
    let decoded: string | JwtPayload;
    try {
      decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET_KEY as string
      ) as JwtPayload;
    } catch (err) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const filePath = path.join(
      __dirname,
      '../../../frontend/forgotPassword.html'
    );
    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    // Check if the token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      const modifiedHtml = htmlContent
        .replace(
          '${resetStatus}',
          '<h2 class="text-2xl font-bold mb-2 text-red-500">This Link is expired!</h2>'
        )
        .replace(
          '${p}',
          '<p class="text-gray-700">The link has reached the 1 hour limit. <br>Please try again or contact admin. <br>Return to <a href="http://localhost:5174/" class="text-indigo-500">BookEzy.com</a></p>'
        )
        .replace('${email}', decoded.email);
      return res.status(400).send(modifiedHtml);
    }

    // Replace placeholders in the HTML with success data
    const modifiedHtml = htmlContent
      .replace(
        '${resetStatus}',
        '<h2 class="text-2xl font-bold mb-2 text-green-500">Reset Your Password</h2>'
      )
      .replace(
        '${p}',
        '<p class="text-gray-700">Please enter your new password below:</p>'
      )
      .replace('${email}', decoded.email);

    // Send the modified HTML as the response
    return res.status(200).send(modifiedHtml);
  } catch (error) {
    console.error('Error getting reset password:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const { password } = req.body;

    // Verify and decode the JWT token
    let decoded: string | JwtPayload;
    try {
      decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET_KEY as string
      ) as JwtPayload;
    } catch (err) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's password
    user.password = password;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
