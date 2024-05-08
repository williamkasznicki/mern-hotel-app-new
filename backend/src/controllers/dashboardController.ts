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
    let selectedHotelAvailableRooms = 0;
    let totalBookings = 0;
    let selectedHotelBookings = 0;

    for (const hotel of hotels) {
      hotelTypes[hotel.type] = (hotelTypes[hotel.type] || 0) + 1;

      const bookings = await Booking.find({ hotelId: hotel._id });
      totalBookings += bookings.length;
      if (hotel._id.toString() === hotelId) {
        selectedHotelBookings = bookings.length;
      }

      for (const booking of bookings) {
        const month = new Date(booking.createdAt).toLocaleString('default', {
          month: 'long',
        });
        const stat = bookingStats.find((s) => s.month === month);
        if (stat) {
          if (booking.status === 'PAID') {
            stat.successfulBookings++;
            stat.revenue += parseFloat(booking.totalCost.toString()); // Convert Decimal128 to number
            totalRevenue += parseFloat(booking.totalCost.toString()); // Convert Decimal128 to number
            if (hotel._id.toString() === hotelId) {
              hotelRevenue += parseFloat(booking.totalCost.toString()); // Convert Decimal128 to number
            }
          } else if (booking.status === 'CANCELLED') {
            stat.cancelledBookings++;
          }
        } else {
          bookingStats.push({
            month,
            successfulBookings: booking.status === 'PAID' ? 1 : 0,
            cancelledBookings: booking.status === 'CANCELLED' ? 1 : 0,
            revenue:
              booking.status === 'PAID'
                ? parseFloat(booking.totalCost.toString())
                : 0, // Convert Decimal128 to number
          });
          if (booking.status === 'PAID') {
            totalRevenue += parseFloat(booking.totalCost.toString()); // Convert Decimal128 to number
            if (hotel._id.toString() === hotelId) {
              hotelRevenue += parseFloat(booking.totalCost.toString()); // Convert Decimal128 to number
            }
          }
        }
      }

      const rooms = await Room.find({ hotelId: hotel._id });
      totalRooms += rooms.length;

      for (const room of rooms) {
        const isAvailable = !room.roomNumbers.some(
          (roomNumber) => roomNumber.isOutOfService
        );
        if (isAvailable) {
          availableRooms++;
          if (hotel._id.toString() === hotelId) {
            selectedHotelAvailableRooms++;
          }
        }
      }
    }

    const availableRoomPercentage = (availableRooms / totalRooms) * 100;

    res.json({
      hotelTypes,
      totalRevenue,
      hotelRevenue,
      bookingStats,
      totalBookings,
      selectedHotelBookings,
      availableRooms,
      selectedHotelAvailableRooms,
      availableRoomPercentage,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
