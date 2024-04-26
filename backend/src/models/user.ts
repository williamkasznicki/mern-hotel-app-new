import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserType } from '../shared/types';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

// middle ware for mongoDB ( which is called by user route line:50 <await user.save()> )
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model<UserType>('User', userSchema);

export default User;
