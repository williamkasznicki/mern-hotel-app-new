import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sendVerificationEmail } from './emailController';
import User from '../models/user';
import Hotel from '../models/hotel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    isSuperAdmin: boolean;
  };
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      _id: req.userId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.userId;

  try {
    const {
      isEmailVerified,
      isSuperAdmin,
      deleted_at,
      oldPassword,
      password,
      ...updatedFields
    } = req.body;

    const user = await User.findOne({
      _id: userId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user wants to change the password
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Old password is required' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedFields.password = hashedPassword;
    }

    // Check if the user wants to change the email
    if (updatedFields.email && updatedFields.email !== user.email) {
      // Reset email verification status if the email is changed
      updatedFields.isEmailVerified = false;

      // Send a new verification email to the updated email address
      const verificationToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '48h' }
      );
      const verificationLink = `http://localhost:${process.env.PORT}/api/auth/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(updatedFields.email, verificationLink);
      return res.status(200).send({
        message:
          'Verification email sent. Please check your email inbox or spam folder to restore your account.',
      });
    }

    // Filter out the empty fields
    const updatedUserFields = Object.fromEntries(
      Object.entries(updatedFields).filter(([, value]) => value !== '')
    );

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, deleted_at: { $in: [null, undefined] } },
      updatedUserFields,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    // Find the user and mark it as deleted
    const deletedUser = await User.findOneAndUpdate(
      { _id: userId, deleted_at: { $in: [null, undefined] } },
      { deleted_at: new Date(), isEmailVerified: false },
      { new: true }
    );

    if (!deletedUser) {
      return res
        .status(404)
        .json({ message: 'User not found or has been deleted' });
    }

    // Soft delete associated hotels
    await Hotel.updateMany({ userId: userId }, { deleted_at: new Date() });

    res.status(200).send({
      message: `User ${deletedUser.email} has been deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user && req.user.isSuperAdmin) {
      const users = await User.find({
        deleted_at: { $in: [null, undefined] },
      }).select('-password');
      res.status(200).json(users);
    } else {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({
      _id: userId,
      deleted_at: { $in: [null, undefined] },
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the requester is a super admin, return the user data regardless of deletion status
    if (req.user && req.user.isSuperAdmin) {
      return res.json(user);
    }

    // If the user is deleted and the requester is not a super admin, return an error
    return res.status(404).json({ message: 'This user has been deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// export const restoreUser = async (req: Request, res: Response) => {
//   const userId = req.params.userId;

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (!user.deleted_at) {
//       return res.status(400).json({ message: 'User is not deleted' });
//     }

//     user.deleted_at = null;
//     await user.save();

//     res.status(200).json({ message: 'User restored successfully' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// };
