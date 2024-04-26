import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Hotel from '../models/hotel';
import Room from '../models/room';
import {
  uploadImages,
  updateHotelFacilities,
  updateHotelStartingPrice,
} from './myHotelController';

export const createRoom = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const hotelId = req.params.hotelId;

  try {
    const hotel = await Hotel.findOne({
      _id: hotelId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ message: `Hotel not found or has been deleted (${hotelId})` });
    }

    const imageFiles = req.files as Express.Multer.File[];
    const imageUrls = await uploadImages(imageFiles);

    const newRoom = new Room({
      hotelId,
      ...req.body,
      imageUrls,
    });

    const savedRoom = await newRoom.save();
    hotel.room.push(savedRoom._id.toString());
    hotel.imageUrls.push(...imageUrls); // Add new imageUrls to the hotel

    try {
      await updateHotelFacilities(hotelId);
      await updateHotelStartingPrice(hotelId);
    } catch (err) {
      console.error('Error updating hotel facilities:', err);
    }

    await hotel.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const roomId = req.params.roomId;

  try {
    const room = await Room.findOne({
      _id: roomId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!room) {
      return res
        .status(404)
        .json({ message: 'Room not found or has been deleted' });
    }

    const imageFiles = req.files as Express.Multer.File[];
    const updatedImageUrls = await uploadImages(imageFiles);

    const previousImageUrls = room.imageUrls || [];

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      {
        ...req.body,
        imageUrls: updatedImageUrls,
      },
      { new: true }
    );

    const hotel = await Hotel.findOne({
      _id: room.hotelId,
      deleted_at: { $in: [null, undefined] },
    });

    if (hotel) {
      // Remove previous image URLs that are no longer present in the updated room
      hotel.imageUrls = hotel.imageUrls.filter(
        (url) =>
          updatedImageUrls.includes(url) || !previousImageUrls.includes(url)
      );

      // Add new image URLs to the hotel
      hotel.imageUrls.push(
        ...updatedImageUrls.filter((url) => !previousImageUrls.includes(url))
      );

      await hotel.save();
    }

    try {
      await updateHotelFacilities(room.hotelId);
      await updateHotelStartingPrice(room.hotelId);
    } catch (err) {
      console.error('Error updating hotel facilities or starting price:', err);
    }

    res.json(updatedRoom);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findOne({
      _id: roomId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!room) {
      return res
        .status(404)
        .json({ message: 'Room not found or has been deleted' });
    }

    room.deleted_at = new Date();
    await room.save();

    // Remove the room's image URLs from the hotel's imageUrls array
    const hotel = await Hotel.findOne({
      _id: room.hotelId,
      deleted_at: { $in: [null, undefined] },
    });

    if (hotel) {
      hotel.imageUrls = hotel.imageUrls.filter(
        (url) => !room.imageUrls.includes(url)
      );

      console.log('roomId: ', roomId);
      // Remove the deleted room's ID from the hotel's room array
      hotel.room = hotel.room.filter((id) => id.toString() !== roomId);

      console.log('hotel.room: ', hotel.room);

      await hotel.save();
    }

    if (!hotel) {
      return res
        .status(404)
        .json({ message: 'Hotel not found or has been deleted' });
    }

    try {
      console.log('room.hotelId: ', room.hotelId);
      console.log('hotel._id: ', hotel?._id);
      await updateHotelFacilities(room.hotelId);
      await updateHotelStartingPrice(room.hotelId);
    } catch (err) {
      console.error('Error updating hotel facilities:', err);
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getHotelRooms = async (req: Request, res: Response) => {
  const hotelId = req.params.hotelId;

  try {
    const hotel = await Hotel.findOne({
      _id: hotelId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ message: 'Hotel not found or has been deleted' });
    }

    const rooms = await Room.find({
      hotelId,
      deleted_at: { $in: [null, undefined] },
    });
    res.json(rooms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  try {
    const room = await Room.findOne({
      _id: roomId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!room) {
      return res
        .status(404)
        .json({ message: 'Room not found or has been deleted' });
    }

    res.json(room);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getMyAvailableRooms = async (req: Request, res: Response) => {
  const hotelId = req.params.hotelId;
  const { checkInDate, checkOutDate } = req.query;

  try {
    const hotel = await Hotel.findOne({
      _id: hotelId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ message: 'Hotel not found or has been deleted' });
    }

    const checkIn = new Date(checkInDate as string);
    const checkOut = new Date(checkOutDate as string);

    const availableRooms = await Room.aggregate([
      {
        $match: {
          hotelId: hotel._id.toString(),
          deleted_at: { $in: [null, undefined] },
        },
      },
      {
        $addFields: {
          unavailableDates: {
            $reduce: {
              input: '$roomNumbers.unavailableDates',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this'] },
            },
          },
        },
      },
      {
        $match: {
          unavailableDates: {
            $not: {
              $elemMatch: {
                $gte: checkIn,
                $lt: checkOut,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          roomType: 1,
          pricePerNight: 1,
          roomFacilities: 1,
          description: 1,
          maxAdult: 1,
          maxChild: 1,
          imageUrls: 1,
          roomNumbers: 1,
          // Add other fields you want to include in the response
        },
      },
    ]);

    if (!availableRooms) {
      return res
        .status(404)
        .json({ message: 'No available rooms for the selected dates' });
    }
    res.json(availableRooms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateRoomNumberAvailability = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
) => {
  try {
    const room = await Room.findOne({
      _id: roomId,
      deleted_at: { $in: [null, undefined] },
    });

    if (!room) {
      throw new Error('Room not found or has been deleted');
    }

    const availableRoomNumber = room.roomNumbers.find((roomNumber) => {
      return !roomNumber.unavailableDates.some((date) => {
        return date >= checkInDate && date < checkOutDate;
      });
    });

    if (!availableRoomNumber) {
      throw new Error('No available room number for the selected dates');
    }

    availableRoomNumber.unavailableDates.push(checkInDate, checkOutDate);

    await room.save();
  } catch (error) {
    console.log(error);
    throw new Error('Failed to update room number availability');
  }
};
