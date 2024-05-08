import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import User from '../models/user';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { BookingType } from '../shared/types';

interface SenderAddress {
  name: string;
  address: string;
}

interface JwtPayload {
  userId: string;
  exp: number;
}

// Function to determine the SMTP host based on the email domain
const getSMTPHost = (email: string): string => {
  const domain = email.split('@')[1];

  switch (domain) {
    case 'gmail.com':
    case 'googlemail.com':
      return 'smtp.gmail.com';
    case 'yahoo.com':
    case 'yahoo.co.uk':
    case 'yahoo.fr':
      return 'smtp.mail.yahoo.com';
    case 'hotmail.com':
    case 'outlook.com':
    case 'live.com':
      return 'smtp.office365.com';
    case 'aol.com':
      return 'smtp.aol.com';
    case 'icloud.com':
    case 'me.com':
      return 'smtp.mail.me.com';
    case 'protonmail.com':
    case 'protonmail.ch':
      return 'smtp.protonmail.com';
    case 'zoho.com':
      return 'smtp.zoho.com';
    case 'yandex.com':
    case 'yandex.ru':
      return 'smtp.yandex.com';
    case 'gmx.com':
    case 'gmx.net':
      return 'smtp.gmx.com';
    case 'aim.com':
      return 'smtp.aim.com';
    case 'comcast.net':
      return 'smtp.comcast.net';
    case 'verizon.net':
      return 'smtp.verizon.net';
    case 'att.net':
      return 'smtp.att.yahoo.com';
    case 'mail.com':
      return 'smtp.mail.com';
    case 'yahoo.co.jp':
      return 'smtp.mail.yahoo.co.jp';
    default:
      return process.env.SMTP_HOST || '';
  }
};

// Function to send verification email
export const sendVerificationEmail = async (
  email: string,
  verificationLink: string
) => {
  // const smtpHost = getSMTPHost(email);
  // console.log('debug smtpHost', smtpHost);

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    port: parseInt(process.env.SMTP_PORT as string) || 587,
    secure: process.env.SMTP_SECURE === 'true', // Use TLS or not, Set to true if using 465 port
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from: SenderAddress = {
    name: process.env.SMTP_SENDER_NAME || '',
    address: process.env.SMTP_SENDER_ADDRESS || '',
  };

  // Define email options
  const mailOptions = {
    from: from,
    to: email,
    subject: 'Email Verification',
    html: `
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f2f2f2;">
      <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <div class="logo" style="text-align: center; margin-bottom: 20px; background-color: #EF2C61; padding: 2px 0px 2px 0px;">
              <h1>BookEzy.com</h1>
          </div>
          <div class="content" style="text-align: center; margin-bottom: 30px;">
              <h2>Email verification</h2>
              <p>Hi ${email},</p>
              <p>You're almost set to start enjoying BookEzy.com. Simply click the link below to verify your email address and get started. The link expires in 48 hours.</p>
              <p class="margin: 0px 0px 6px 0px;">Please click the following link to verify your email address:</p>
              <a href="${verificationLink}" style="color: #007bff; font-size: 18px; padding: 8px; background-color: #EF2C61; border-radius: 5px; color: #000000; color: white; ">Verify Email</a>
          </div>
          <p style="text-align: center;">&copy; 2024 BookEzy.com. All rights reserved.</p>
      </div>
    </body>
`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('debug sendEmail: Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    // Check if token exists
    if (!token) {
      return res.status(400).json({
        message: 'Verification token is missing, please try again later',
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
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Check if decoded is a JwtPayload
    if (typeof decoded === 'object' && decoded !== null) {
      const userId = decoded.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ message: 'User not found! Failed to verify email' });
      }

      const filePath = path.join(
        __dirname,
        '../../../frontend/emailVerified.html'
      );
      const htmlContent = fs.readFileSync(filePath, 'utf-8');

      // Check if the token is expired
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        const modifiedHtml = htmlContent
          .replace(
            '${verifyStatus}',
            'h2 class="text-2xl font-bold mb-2 text-red-500">This Link is expired!</h2>'
          )
          .replace(
            '${p}',
            ' <p class="text-gray-700">the link has reaching the 48 hours limit. <br>please try again or contact admin. <br>return to <a href="http://localhost:5174/" class="text-indigo-500">BookEzy.com</a></p>'
          )
          .replace('${email}', user.email);
        return res.status(400).send(modifiedHtml);
      }

      // Check if the user is already verified
      if (user.isEmailVerified) {
        // Replace placeholders in the HTML with unsuccess data
        const modifiedHtml = htmlContent
          .replace(
            '${verifyStatus}',
            '<h2 class="text-2xl font-bold mb-2 text-red-500">This Email has already been verified!</h2>'
          )
          .replace(
            '${p}',
            ' <p class="text-gray-700">please contact admin. <br>return to <a href="http://localhost:5174/login" class="text-indigo-500">BookEzy.com</a></p>'
          )
          .replace('${email}', user.email);
        return res.status(400).send(modifiedHtml);
      }
      // Read the HTML file

      // Replace placeholders in the HTML with success data
      const modifiedHtml = htmlContent
        .replace(
          '${verifyStatus}',
          '<h2 class="text-2xl font-bold mb-2 text-green-500">Email verified successfully!</h2>'
        )
        .replace(
          '${p}',
          ' <p class="text-gray-700">Thank you for verifying your email. <br>return to <a href="http://localhost:5174/login" class="text-indigo-500">BookEzy.com</a></p>'
        )
        .replace('${email}', user.email);

      // Update the user's verification status
      user.isEmailVerified = true;
      user.deleted_at = null; // Remove the deleted_at field if present
      await user.save();

      // Send the modified HTML as the response
      return res.status(200).send(modifiedHtml);
    } else {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const sendVerificationEmailManual = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '48h' }
    );
    const verificationLink = `http://localhost:${process.env.BACKEND_PORT}/api/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, verificationLink);

    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const sendResetPasswordMail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '1h' }
    );

    const resetLink = `http://localhost:${process.env.BACKEND_PORT}/api/auth/reset-password?token=${resetToken}`;

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      port: parseInt(process.env.SMTP_PORT as string) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const from: SenderAddress = {
      name: process.env.SMTP_SENDER_NAME || '',
      address: process.env.SMTP_SENDER_ADDRESS || '',
    };

    const mailOptions = {
      from: from,
      to: email,
      subject: 'Password Reset',
      html: `
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f2f2f2;">
          <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <div class="logo" style="text-align: center; margin-bottom: 20px; background-color: #EF2C61; padding: 2px 0px 2px 0px;">
                  <h1>BookEzy.com</h1>
              </div>
              <div class="content" style="text-align: center; margin-bottom: 30px;">
                  <h2>Password Reset</h2>
                  <p>Hi ${email},</p>
                  <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                  <a href="${resetLink}" style="color: #007bff; font-size: 18px; padding: 8px; background-color: #EF2C61; border-radius: 5px; color: #000000; color: white; ">Reset Password</a>
              </div>
              <p style="text-align: center;">&copy; 2024 BookEzy.com. All rights reserved.</p>
          </div>
        </body>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const sendBookingConfirmationEmail = async (
  email: string,
  bookingDetails: BookingType,
  hotelName: string,
  roomType: string
) => {
  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    port: parseInt(process.env.SMTP_PORT as string) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from: SenderAddress = {
    name: process.env.SMTP_SENDER_NAME || '',
    address: process.env.SMTP_SENDER_ADDRESS || '',
  };

  const mailOptions = {
    from: from,
    to: email,
    subject: 'Booking Confirmation',
    html: `
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f2f2f2;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <div class="logo" style="text-align: center; margin-bottom: 20px; background-color: #EF2C61; padding: 2px 0px 2px 0px;">
            <h1 style="color: #fff; font-size: 24px; margin: 0;">BookEzy.com</h1>
          </div>
          <div class="content" style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px;">Booking Confirmation</h2>
            <p style="color: #666; font-size: 16px;">Hi ${email},</p>
            <p style="color: #666; font-size: 16px;">Your booking has been confirmed. Here are the booking details:</p>
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Hotel Name:</strong></td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${hotelName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Citizen & Passport ID:</strong></td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${
                  bookingDetails.citizen_id
                }</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Phone:</strong></td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${
                  bookingDetails.phone
                }</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Status:</strong></td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${
                  bookingDetails.status
                }</td>
              </tr>
            
              <tr>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Room Type:</strong></td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${roomType}</td>
              </tr>
              <tr>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Check-in Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${new Date(
                bookingDetails.check_in
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Check-out Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${new Date(
                bookingDetails.check_out
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Booked at:</strong></td>
              <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${new Date().toLocaleString()}</td>
            </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;"><strong>Total Cost:</strong></td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: left;">${
                  bookingDetails.totalCost
                }</td>
              </tr>
            </table>
            <p style="color: #666; font-size: 16px; margin-top: 20px;">Thank you for choosing BookEzy.com. We look forward to your stay!</p>
          </div>
          <div class="footer" style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>&copy; 2024 BookEzy.com. All rights reserved.</p>
          </div>
        </div>
      </body>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw new Error('Failed to send booking confirmation email');
  }
};
