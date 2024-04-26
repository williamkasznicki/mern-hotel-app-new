import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {
  updateHotelFacilities,
  updateHotelStartingPrice,
} from './myHotelController';
import Room from '../models/room';

export const createRoomNumber = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const roomId = req.params.roomId;
  const room = await Room.findOne({
    _id: roomId,
    deleted_at: { $in: [null, undefined] },
  });
  if (!room) {
    return res
      .status(400)
      .json({ message: `Room not found or has been deleted` });
  }

  try {
    const newRoomNumber = {
      roomId: roomId,
      ...req.body,
      deleted_at: null,
    };

    room.roomNumbers.push(newRoomNumber);
    const savedRoom = await room.save();

    try {
      await updateHotelFacilities(room.hotelId);
      await updateHotelStartingPrice(room.hotelId);
    } catch (err) {
      res.status(500).json({
        message: 'Something went wrong, cannot update hotel facilities',
      });
    }

    res.status(201).json(savedRoom);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateRoomNumber = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const roomNumberId = req.params.roomNumberId;

  try {
    const room = await Room.findOneAndUpdate(
      {
        'roomNumbers._id': roomNumberId,
        'roomNumbers.deleted_at': { $in: [null, undefined] },
      },
      {
        $set: {
          'roomNumbers.$.roomNumberName': req.body.roomNumberName,
          // Update other fields as needed
        },
      },
      { new: true }
    );

    if (!room || !room.roomNumbers || room.roomNumbers.length === 0) {
      return res.status(404).json({ message: 'Room number not found or has been deleted' });
    }

    const updatedRoomNumber = room.roomNumbers.find(
      (roomNumber) => roomNumber._id.toString() === roomNumberId
    );

    try {
      await updateHotelFacilities(room.hotelId);
      await updateHotelStartingPrice(room.hotelId);
    } catch (err) {
      res.status(500).json({
        message: 'Something went wrong, cannot update hotel facilities',
      });
    }

    res.json(updatedRoomNumber);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteRoomNumber = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const roomNumberId = req.params.roomNumberId;

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

    const roomNumberIndex = room.roomNumbers.findIndex(
      (roomNumber) => roomNumber._id.toString() === roomNumberId
    );

    if (roomNumberIndex === -1) {
      return res.status(404).json({ message: 'Room number not found' });
    }

    room.roomNumbers[roomNumberIndex].deleted_at = new Date();
    await room.save();

    try {
      await updateHotelFacilities(room.hotelId);
      await updateHotelStartingPrice(room.hotelId);
    } catch (err) {
      return res.status(500).json({
        message: 'Something went wrong, cannot update hotel facilities',
      });
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getRoomNumbersOfRoom = async (req: Request, res: Response) => {
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

    const roomNumbers = room.roomNumbers.filter(
      (roomNumber) => !roomNumber.deleted_at
    );
    res.json(roomNumbers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getRoomNumberById = async (req: Request, res: Response) => {
  const roomNumberId = req.params.roomNumberId;

  try {
    const roomNumber = await Room.findOne(
      {
        'roomNumbers._id': roomNumberId,
        'roomNumbers.deleted_at': { $in: [null, undefined] },
      },
      { 'roomNumbers.$': 1 }
    );

    if (
      !roomNumber ||
      !roomNumber.roomNumbers ||
      roomNumber.roomNumbers.length === 0
    ) {
      return res
        .status(404)
        .json({ message: 'Room number not found or has been deleted' });
    }

    res.json(roomNumber.roomNumbers[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateRoomNumberOutOfService = async (
  req: Request,
  res: Response
) => {
  const roomId = req.params.roomId;
  const roomNumberId = req.params.roomNumberId;
  const isOutOfService = req.body.isOutOfService;

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

    const roomNumber = room.roomNumbers.find(
      (number) => number._id.toString() === roomNumberId
    );

    if (!roomNumber) {
      return res.status(404).json({ message: 'Room number not found' });
    }

    roomNumber.isOutOfService = isOutOfService;
    await room.save();

    res.json({
      message: 'Room number out of service status updated successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
