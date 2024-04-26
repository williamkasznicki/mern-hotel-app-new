import { Request, Response } from 'express';
import Hotel from '../models/hotel';
import Room from '../models/room';
import Booking from '../models/booking';
import { BookingType } from '../shared/types';
import { validationResult } from 'express-validator';
import Stripe from 'stripe';
import User from '../models/user';

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: '2023-10-16',
});

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { hotelId, numberOfNights, roomType, checkIn, checkOut } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const room = await Room.findOne({ hotelId, roomType });
    if (!room) {
      return res.status(404).json({ message: 'Room type not found' });
    }

    // Find an available room number
    const availableRoomNumber = room.roomNumbers.find((roomNumber) => {
      // Check if the room number is available for the selected dates
      return !roomNumber.unavailableDates.some((date) => {
        // Remove the time portion from the date
        const unavailableDate = new Date(date);
        unavailableDate.setHours(0, 0, 0, 0);

        return unavailableDate >= checkIn && unavailableDate < checkOut;
      });
    });

    if (!availableRoomNumber) {
      return res
        .status(400)
        .json({ message: 'No available room numbers for the selected dates' });
    }

    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing userID' });
    }

    const totalCost = room.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100, // Amount in cents
      currency: 'thb',
      metadata: {
        hotelId,
        roomType,
        roomNumberId: availableRoomNumber._id,
        userId: req.userId,
      },
    });

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      totalCost,
    };

    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.userId });
    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unable to fetch bookings' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { hotelId, totalCost, checkIn, checkOut, citizen_id } = req.body;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(
      req.body.paymentIntentId
    );
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Find the room based on the hotelId and roomType
    const room = await Room.findOne({ hotelId, _id: req.body.roomType });

    if (!room) {
      return res.status(404).json({ message: 'Room type not found' });
    }

    const availableRoomNumber = room.roomNumbers.find((roomNumber) => {
      // Check if the room number is available for the selected dates and not out of service
      return (
        !roomNumber.isOutOfService &&
        !roomNumber.unavailableDates.some((date) => {
          // Remove the time portion from the date
          const unavailableDate = new Date(date);
          unavailableDate.setHours(0, 0, 0, 0);

          return unavailableDate >= checkIn && unavailableDate < checkOut;
        })
      );
    });
    console.log('availableRoomNumber: ', availableRoomNumber);
    //const roomId = req.body.roomType;
    //await updateRoomNumberAvailability(roomId, checkIn, checkOut);

    if (!availableRoomNumber) {
      return res
        .status(400)
        .json({ message: 'No available room numbers for the selected dates' });
    }

    try {
      console.log('checkIn: ', checkIn);
      console.log('checkOut: ', checkOut);

      // Update the unavailable dates for the selected room number
      availableRoomNumber.unavailableDates.push(
        new Date(checkIn),
        new Date(checkOut)
      );
    } catch (error) {
      console.log('Push Date to availableRoomNumber error: ', error);
    }
    await room.save();

    // Create new booking
    const newBooking: BookingType = {
      ...req.body,
      paymentIntentId: req.body.paymentIntentId,
      userId: req.userId,
      hotelId,
      status: req.body.status,
      roomNumberId: availableRoomNumber._id.toString(),
      check_in: checkIn,
      check_out: checkOut,
      citizen_id: citizen_id,
      totalCost: parseInt(totalCost),
    };

    const booking = new Booking(newBooking);
    await booking.save();

    hotel.bookings.push(booking._id.toString());
    await hotel.save();

    availableRoomNumber.bookingId.push(booking._id.toString());
    await room.save();

    res.status(201).json(newBooking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unable to create booking' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const bookingId = req.params.bookingId;
  const userId = req.userId;

  try {
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'CANCELLED') {
      return res
        .status(400)
        .json({ message: 'Booking has already been cancelled' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the booking status to 'CANCELLED'
    booking.status = 'CANCELLED';

    booking.cancelledBy = user.email;

    // Find the room associated with the booking
    const room = await Room.findOne({ hotelId: booking.hotelId });

    if (room) {
      // Find the room number associated with the booking
      const roomNumber = room.roomNumbers.find(
        (number) => number._id.toString() === booking.roomNumberId
      );

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      if (roomNumber) {
        // Remove the booking dates from the room number's unavailableDates array
        roomNumber.unavailableDates = roomNumber.unavailableDates.filter(
          (date) => date < booking.check_in || date >= booking.check_out
        );
        if (!roomNumber) {
          return res.status(404).json({ message: 'Room number not found' });
        }

        await room.save();
      }
    }

    // Save the updated booking
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const bookingId = req.params.id;

  try {
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Remove the booking ID from the hotel's bookings array
    await Hotel.updateOne(
      { _id: booking.hotelId },
      { $pull: { bookings: booking._id.toString() } }
    );

    // Find the room associated with the booking
    const room = await Room.findOne({ hotelId: booking.hotelId });

    if (room) {
      // Find the room number associated with the booking
      const roomNumber = room.roomNumbers.find(
        (number) => number._id.toString() === booking.roomNumberId
      );

      if (roomNumber) {
        // Remove the booking ID from the room number's bookingId array
        roomNumber.bookingId = roomNumber.bookingId.filter(
          (id) => id !== booking._id.toString()
        );

        // Remove the booking dates from the room number's unavailableDates array
        roomNumber.unavailableDates = roomNumber.unavailableDates.filter(
          (date) => date < booking.check_in || date >= booking.check_out
        );

        await room.save();
      }
    }

    // Delete the booking from the bookings collection
    await Booking.deleteOne({ _id: bookingId });

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unable to delete booking' });
  }
};

/*export const updateBooking = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const bookingId = req.params.id;

  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unable to update booking' });
  }
};*/

/*export const deleteBooking = async (req: Request, res: Response) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findOneAndDelete({
      _id: bookingId,
      userId: req.userId,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unable to delete booking' });
  }
};*/
