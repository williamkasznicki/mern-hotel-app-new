import { Request, Response } from 'express';
import Booking from '../models/booking';

export const getBookingById = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching booking' });
  }
};
