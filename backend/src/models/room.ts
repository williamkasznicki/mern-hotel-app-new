import mongoose from 'mongoose';
import { Decimal128 } from 'mongodb';
import { RoomType, RoomNumberType } from '../shared/types';

const roomNumberSchema = new mongoose.Schema<RoomNumberType>(
  {
    roomId: { type: String, required: true },
    roomNumberName: { type: String, required: true },
    isOutOfService: { type: Boolean, default: false },
    unavailableDates: { type: [Date], default: [] },
    bookingId: { type: [String], default: [] },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema<RoomType>(
  {
    hotelId: { type: String, required: true },
    roomType: { type: String, required: true },
    description: { type: String, required: true },
    pricePerNight: { type: Decimal128, required: true },
    roomFacilities: { type: [String], required: true },
    maxAdult: { type: Number },
    maxChild: { type: Number },
    imageUrls: { type: [String], required: true },
    deleted_at: { type: Date, default: null },
    roomNumbers: [roomNumberSchema],
  },
  { timestamps: true }
);

export default mongoose.model<RoomType>('Room', roomSchema, 'roomTypes');