import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { showToast } = useAppContext();

  const {
    data: booking,
    isLoading: isBookingLoading,
    isError: isBookingError,
  } = useQuery(
    ['fetchBookingById', bookingId],
    () => apiClient.fetchBookingById(bookingId!),
    {
      enabled: !!bookingId,
      onError: () => {
        showToast({
          message: 'Error fetching booking details',
          type: 'ERROR',
        });
      },
    }
  );

  const {
    data: hotel,
    isLoading: isHotelLoading,
    isError: isHotelError,
  } = useQuery(
    ['fetchHotelById', booking?.hotelId],
    () => apiClient.fetchHotelById(booking?.hotelId!),
    {
      enabled: !!booking?.hotelId,
      onError: () => {
        showToast({
          message: 'Error fetching hotel',
          type: 'ERROR',
        });
      },
    }
  );

  const {
    data: roomNumber,
    isLoading: isRoomNumberLoading,
    isError: isRoomNumberError,
  } = useQuery(
    ['fetchMyRoomNumberById', booking?.roomNumberId],
    () => apiClient.fetchMyRoomNumberById(booking?.roomNumberId!),
    {
      enabled: !!booking?.roomNumberId,
      onError: () => {
        showToast({
          message: 'Error fetching room number',
          type: 'ERROR',
        });
      },
    }
  );

  if (isBookingError || isHotelError || isRoomNumberError || !booking) {
    return <div>No booking found or invalid booking ID </div>;
  }

  if (isBookingLoading || isHotelLoading || isRoomNumberLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold inline-block mr-2">Booking Details</h1>{' '}
      <span
        className={
          booking.status === 'PAID'
            ? 'bg-green-500 p-2 rounded-md font-bold text-white'
            : 'bg-red-500 p-2 rounded-md font-bold text-white'
        }
      >
        {booking.status}
      </span>
      <table className="w-full border-collapse dark:bg-slate-800 dark:text-white">
        <tbody>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">Booking ID</td>
            <td className="border border-gray-400 p-2">{booking._id}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">First Name</td>
            <td className="border border-gray-400 p-2">{booking.firstName}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">Last Name</td>
            <td className="border border-gray-400 p-2">{booking.lastName}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">Email</td>
            <td className="border border-gray-400 p-2">{booking.email}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">Phone</td>
            <td className="border border-gray-400 p-2">{booking.phone}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">Citizen ID</td>
            <td className="border border-gray-400 p-2">{booking.citizen_id}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">
              Check-In Date
            </td>
            <td className="border border-gray-400 p-2">
              {new Date(booking.check_in).toLocaleDateString()}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">
              Check-Out Date
            </td>
            <td className="border border-gray-400 p-2">
              {new Date(booking.check_out).toLocaleDateString()}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">Hotel Name</td>
            <td className="border border-gray-400 p-2">{hotel?.name}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">
              Room Number Name
            </td>
            <td className="border border-gray-400 p-2">
              {roomNumber?.roomNumberName}
            </td>
          </tr>

          <tr>
            <td className="border border-gray-400 p-2 font-bold">Total Cost</td>
            <td className="border border-gray-400 p-2">฿{booking.totalCost}</td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">
              Payment Intent ID
            </td>
            <td className="border border-gray-400 p-2">
              {booking.paymentIntentId}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-2 font-bold">Booked At</td>
            <td className="border border-gray-400 p-2">
              {new Date(booking.createdAt).toLocaleString()}
            </td>
          </tr>
          {booking.status === 'CANCELLED' && (
            <>
              <tr>
                <td className="border border-gray-400 p-2 font-bold">
                  Cancelled At
                </td>
                <td className="border border-gray-400 p-2 text-red-500">
                  {new Date(booking.updatedAt).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-bold">
                  Cancelled By
                </td>
                <td className="border border-gray-400 p-2 text-red-500">
                  {booking.cancelledBy}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingDetails;
