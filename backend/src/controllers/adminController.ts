import { Request, Response } from 'express';
import User from '../models/user';
import Hotel from '../models/hotel';
import Room from '../models/room';
import Booking from '../models/booking';
import Review from '../models/review';

export const getAllUsers = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    search = '',
  } = req.query;

  try {
    const filter = {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    };

    const totalCount = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data: users,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getAllHotels = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    search = '',
  } = req.query;

  try {
    const filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ],
    };

    const totalCount = await Hotel.countDocuments(filter);
    const hotels = await Hotel.find(filter)
      .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data: hotels,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching hotels' });
  }
};

export const getAllRooms = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    search = '',
  } = req.query;

  try {
    const filter = {
      $or: [
        { roomType: { $regex: search, $options: 'i' } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$pricePerNight' },
              regex: search,
              options: 'i',
            },
          },
        },
      ],
      deleted_at: { $in: [null, undefined] },
    };

    const totalCount = await Room.countDocuments(filter);
    const rooms = await Room.find(filter)
      .populate('roomNumbers')
      .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data: rooms,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    search = '',
  } = req.query;

  try {
    const filter = {
      $or: [
        { userId: { $regex: search, $options: 'i' } },
        { hotelId: { $regex: search, $options: 'i' } },
        { roomNumberId: { $regex: search, $options: 'i' } },
      ],
    };

    const totalCount = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data: bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    search = '',
  } = req.query;

  try {
    const filter = {
      $or: [
        { userId: { $regex: search, $options: 'i' } },
        { hotelId: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
      ],
      deleted_at: { $in: [null, undefined] },
    };

    const totalCount = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data: reviews,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      totalCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

export const getDashboardCounts = async (req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments({
      deleted_at: { $in: [null, undefined] },
    });
    const hotelCount = await Hotel.countDocuments({
      deleted_at: { $in: [null, undefined] },
    });
    const roomCount = await Room.countDocuments({
      deleted_at: { $in: [null, undefined] },
    });
    const reviewCount = await Review.countDocuments({
      deleted_at: { $in: [null, undefined] },
    });
    const bookingCount = await Booking.countDocuments();

    res.json({
      userCount,
      hotelCount,
      roomCount,
      reviewCount,
      bookingCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching dashboard counts' });
  }
};
