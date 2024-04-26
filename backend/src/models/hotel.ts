import mongoose from 'mongoose';
import { HotelType } from '../shared/types';

const hotelSchema = new mongoose.Schema<HotelType>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    address: { type: String, required: true },
    landmarks: [{ name: String, distance: String }],
    coordinate: { type: [String], default: [] },
    starRating: { type: Number, default: null, min: 1, max: 5 },
    allFacilities: { type: [String], default: [] },
    startingPrice: { type: Number, default: null },
    imageUrls: [{ type: String, required: true }],
    deleted_at: { type: Date, default: null },
    room: { type: [String], default: [] },
    review: { type: [String], default: [] },
    bookings: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<HotelType>('Hotel', hotelSchema);
