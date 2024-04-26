import { Request, Response, NextFunction } from 'express';
import cloudinary from 'cloudinary';
import Hotel from '../models/hotel';
import Booking from '../models/booking';
import Room from '../models/room';
import Review from '../models/review';
import { validationResult } from 'express-validator';
import { HotelType } from '../shared/types';

export const uploadImages = async (imageFiles: Express.Multer.File[]) => {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString('base64');
    let dataURI = 'data:' + image.mimetype + ';base64,' + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    console.log('res from cloudinary:', res);
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
};

export const createHotel = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const imageFiles = req.files as Express.Multer.File[];
    const newHotel: HotelType = req.body;
    4;
    if (res.locals.fileTooLarge) {
      return res.status(413).json({ message: 'File size too large' });
    }

    // upload images to cloudinary
    const imageUrls = await uploadImages(imageFiles);

    newHotel.imageUrls = imageUrls;

    if (req.userId) {
      newHotel.userId = req.userId; //get userId from auth_token cookie
    } else {
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }

    try {
      const hotel = new Hotel(newHotel);
      await hotel.save();
      console.log('Hotel saved successfully:', hotel);
      res.status(201).send(hotel);
    } catch (error) {
      console.error('Error saving hotel:', error);
      throw new Error('Failed to save hotel');
    }
  } catch (e) {
    res.status(500).json({ message: 'Error creating hotel' });
  }
};

export const getHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({
      userId: req.userId,
      deleted_at: { $in: [null, undefined] },
    });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels' });
  }
};

export const getHotelById = async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  try {
    const hotel = await Hotel.findOne({
      _id: id,
      userId: req.userId,
      deleted_at: { $in: [null, undefined] },
    })
      .populate('review')
      .populate('bookings');
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotel' });
  }
};

export const getMyHotelBookings = async (req: Request, res: Response) => {
  const hotelId = req.params.hotelId;

  try {
    // Find the hotel by ID
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Find all bookings associated with the hotel ID
    const bookings = await Booking.find({ hotelId });

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unable to fetch hotel bookings' });
  }
};

export const updateHotel = async (req: Request, res: Response) => {
  try {
    const updatedHotel: HotelType = req.body;

    const hotel = await Hotel.findOneAndUpdate(
      {
        _id: req.params.hotelId,
        userId: req.userId,
        deleted_at: null,
      },
      updatedHotel,
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const files = req.files as Express.Multer.File[];
    const updatedImageUrls = await uploadImages(files);

    hotel.imageUrls = [...updatedImageUrls, ...(updatedHotel.imageUrls || [])];

    await hotel.save();

    try {
      await updateHotelFacilities(req.params.hotelId);
      await updateHotelStartingPrice(req.params.hotelId);
    } catch (err) {
      res.status(500).json({
        message: 'Something went wrong, cannot update hotel facilities',
      });
    }

    res.status(200).json(hotel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteHotel = async (req: Request, res: Response) => {
  const hotelId = req.params.hotelId;

  try {
    // Find the hotel by ID and user ID
    const hotel = await Hotel.findOne({
      _id: hotelId,
      userId: req.userId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Soft delete the hotel by setting the deleted_at field
    hotel.deleted_at = new Date();
    await hotel.save();

    // Delete all associated rooms
    await Room.updateMany({ hotelId: hotelId }, { deleted_at: new Date() });

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting hotel' });
  }
};

export const updateHotelFacilities = async (hotelId: string) => {
  try {
    // Aggregate pipeline to get all active roomFacilities for a given hotel
    const pipeline = [
      { $match: { hotelId, deleted_at: { $in: [null, undefined] } } }, // Match active rooms belonging to the specified hotel
      { $unwind: '$roomFacilities' }, // Unwind the roomFacilities array
      {
        $group: { _id: null, allFacilities: { $addToSet: '$roomFacilities' } },
      }, // Group to get unique facilities
    ];

    // Execute aggregation pipeline
    const result = await Room.aggregate(pipeline);

    // Extract allFacilities array from result
    const allFacilities = result.length > 0 ? result[0].allFacilities : [];

    // Update allFacilities field in Hotel schema
    await Hotel.findByIdAndUpdate(hotelId, { allFacilities });

    console.log('allFacilities updated successfully.');
  } catch (error) {
    console.error('Error updating allFacilities:', error);
  }
};

export const updateHotelStartingPrice = async (hotelId: string) => {
  try {
    // Find the hotel by hotelId
    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      console.error('Hotel not found');
      return;
    }

    // Find the minimum price per night from all the rooms of the hotel
    const minPriceRoom = await Room.findOne({
      hotelId,
      deleted_at: { $in: [null, undefined] },
    })
      .sort({ pricePerNight: 1 })
      .select('pricePerNight');

    if (minPriceRoom) {
      // Update the startingPrice field in the Hotel model
      hotel.startingPrice = minPriceRoom.pricePerNight;
      await hotel.save();

      console.log('startingPrice updated successfully.');
    } else {
      console.log('No active rooms found for the hotel.');
    }
  } catch (error) {
    console.error('Error updating startingPrice:', error);
  }
};
