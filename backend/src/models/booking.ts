import mongoose from 'mongoose';
import { BookingType } from '../shared/types';

const bookingSchema = new mongoose.Schema<BookingType>(
  {
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    citizen_id: { type: String, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'CANCELLED'],
      required: true,
    },
    cancelledBy: { type: String, default: null },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
    hotelId: { type: String, required: true },
    roomNumberId: { type: String, required: true },
    totalCost: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<BookingType>('Booking', bookingSchema);
