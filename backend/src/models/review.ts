import mongoose from 'mongoose';
import { ReviewType } from '../shared/types';

const reviewSchema = new mongoose.Schema<ReviewType>(
  {
    userId: { type: String, required: true },
    hotelId: { type: String, required: true },
    userName: { type: String, required: true },
    starRating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

export default  mongoose.model<ReviewType>('Review', reviewSchema);