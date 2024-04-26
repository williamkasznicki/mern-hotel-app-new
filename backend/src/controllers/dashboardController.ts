import { Request, Response } from 'express';
import Hotel from '../models/hotel';
import Booking from '../models/booking';
import Room from '../models/room';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.query;
    const userId = req.userId;
    const query = { userId };
    const hotels = await Hotel.find(query);

    const hotelTypes: { [key: string]: number } = {};
    let totalRevenue = 0;
    let hotelRevenue = 0;
    const bookingStats: {
      month: string;
      successfulBookings: number;
      cancelledBookings: number;
      revenue: number;
    }[] = [];
    let totalRooms = 0;
    let availableRooms = 0;

    for (const hotel of hotels) {
      hotelTypes[hotel.type] = (hotelTypes[hotel.type] || 0) + 1;
      const bookings = await Booking.find({ hotelId: hotel._id });
      for (const booking of bookings) {
        const month = new Date(booking.createdAt).toLocaleString('default', {
          month: 'long',
        });
        const stat = bookingStats.find((s) => s.month === month);
        if (stat) {
          if (booking.status === 'PAID') {
            stat.successfulBookings++;
            stat.revenue += booking.totalCost;
            // ...
          } else if (booking.status === 'CANCELLED') {
            stat.cancelledBookings++;
          }
        } else {
          bookingStats.push({
            month,
            successfulBookings: booking.status === 'PAID' ? 1 : 0,
            cancelledBookings: booking.status === 'CANCELLED' ? 1 : 0,
            revenue: booking.status === 'PAID' ? booking.totalCost : 0,
          });
          if (booking.status === 'PAID') {
            totalRevenue += booking.totalCost;
            if (hotel._id.toString() === hotelId) {
              hotelRevenue += booking.totalCost;
            }
          }
        }
      }

      const rooms = await Room.find({ hotelId: hotel._id });
      totalRooms += rooms.length;
      for (const room of rooms) {
        const isAvailable = !room.roomNumbers.some((roomNumber) =>
          roomNumber.unavailableDates.some(
            (date) => new Date(date) >= new Date()
          )
        );
        if (isAvailable) {
          availableRooms++;
        }
      }
    }

    const occupancyRate =
      availableRooms === 0
        ? 0
        : ((totalRooms - availableRooms) / totalRooms) * 100;
    const availableRoomPercentage = (availableRooms / totalRooms) * 100;

    res.json({
      hotelTypes,
      totalRevenue,
      hotelRevenue,
      bookingStats,
      occupancyRate,
      availableRooms,
      availableRoomPercentage,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
