import { Request, Response } from 'express';
import Hotel from '../models/hotel';
import User from '../models/user';
import Review from '../models/review';
import Booking from '../models/booking';
import multer from 'multer';
import { validationResult } from 'express-validator';

const upload = multer().none();

export const createReview = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const hotelId = req.params.hotelId;
  const userId = req.userId;

  try {
    // Check if the user has a booking for the hotel
    const booking = await Booking.findOne({ userId, hotelId });
    if (!booking) {
      return res.status(403).json({
        message: 'You can only leave a review for a hotel you have booked',
      });
    }

    // Check if the booking has passed the check-out date
    const currentDate = new Date();
    const checkOutDate = new Date(booking.check_out);
    if (currentDate <= checkOutDate) {
      return res.status(403).json({
        message: 'You can only leave a review after the check-out date',
      });
    }

    // Check if the user has already left a review for the hotel
    const existingReview = await Review.findOne({ userId, hotelId });
    if (existingReview) {
      return res.status(403).json({
        message: 'You have already left a review for this hotel',
      });
    }

    const user = await User.findOne({
      _id: userId,
      deleted_at: { $in: [null, undefined] },
    });

    const hotel = await Hotel.findOne({
      _id: hotelId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    upload(req, res, async (err) => {
      if (err) {
        console.log('Multer error:', err);
        return res.status(400).json({ message: 'Error parsing form data' });
      }

      const newReview = new Review({
        userId: userId,
        hotelId: hotelId,
        userName: user?.firstName,
        starRating: parseInt(req.body.starRating),
        comment: req.body.comment,
      });

      console.log(req.body);

      try {
        const savedReview = await newReview.save();
        hotel.review.push(savedReview._id.toString());
        await hotel.save();
        res.status(201).json(savedReview);
      } catch (err) {
        console.log('err ', err);
        res.status(500).json({ message: 'Something went wrong' });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const reviewId = req.params.reviewId;
  const userId = req.userId;

  try {
    const review = await Review.findOne({ _id: reviewId, userId });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.deleted_at) {
      return res.status(404).json({ message: 'Review has been deleted' });
    }

    Object.assign(review, req.body);
    await review.save();

    res.json(review);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  const userId = req.userId;

  try {
    const review = await Review.findOne({ _id: reviewId, userId });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.deleted_at) {
      return res
        .status(404)
        .json({ message: 'Review has already been deleted' });
    }

    review.deleted_at = new Date();
    await review.save();

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getHotelReviews = async (req: Request, res: Response) => {
  const hotelId = req.params.hotelId;

  try {
    const hotel = await Hotel.findOne({
      _id: hotelId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const reviews = await Review.find({
      _id: { $in: hotel.review },
      deleted_at: { $in: [null, undefined] },
    });

    const ratingCounts = await Review.aggregate([
      {
        $match: { hotelId: hotelId, deleted_at: { $in: [null, undefined] } },
      },
      { $group: { _id: '$starRating', count: { $sum: 1 } } },
    ]);

    res.json({ reviews, ratingCounts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
