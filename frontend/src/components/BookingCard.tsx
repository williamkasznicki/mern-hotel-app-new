import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import * as apiClient from '../api-client';
import { BookingType } from '../../../backend/src/shared/types';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { Spinner } from 'flowbite-react';

const BookingCard = ({ booking }: { booking: BookingType }) => {
  const { showToast } = useAppContext();
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const { data: hotel, isLoading: isHotelLoading } = useQuery(
    ['fetchHotelById', booking.hotelId],
    () => apiClient.fetchHotelById(booking.hotelId),
    { enabled: !!booking.hotelId }
  );

  const { data: roomNumber, isLoading: isRoomNumberLoading } = useQuery(
    ['fetchRoomNumberById', booking.roomNumberId],
    () => apiClient.fetchMyRoomNumberById(booking.roomNumberId),
    { enabled: !!booking.roomNumberId }
  );

  const { mutate: cancelBooking, isLoading: isCancellingBooking } = useMutation(
    () => apiClient.cancelMyBookingById(booking._id),
    {
      onSuccess: () => {
        showToast({ message: 'Booking Cancelled!', type: 'SUCCESS' });
        window.location.reload();
      },
      onError: () => {
        showToast({ message: 'Error Cancelling Booking', type: 'ERROR' });
      },
    }
  );

  const isExpired = () => {
    const today = new Date();
    const checkOutDate = new Date(booking.check_out);
    return today > checkOutDate;
  };

  const toggleCancelConfirmation = () => {
    setShowCancelConfirmation(!showCancelConfirmation);
  };

  const handleCancelBooking = () => {
    const currentDate = new Date();
    const checkInDate = new Date(booking.check_in);
    const oneDayBeforeCheckIn = new Date(checkInDate);
    oneDayBeforeCheckIn.setDate(checkInDate.getDate() - 1);

    if (currentDate >= oneDayBeforeCheckIn) {
      // Display a modal or message indicating that cancellation is not allowed
      alert(
        'Cancellation is not allowed within 1 day before the check-in date.'
      );
    } else {
      cancelBooking();
      toggleCancelConfirmation();
    }
  };

  return (
    <>
      {isHotelLoading || isRoomNumberLoading ? (
        <Spinner
          color="purple"
          aria-label="Purple spinner"
          size={'xl'}
          className="mx-auto"
        />
      ) : (
        <div className="border border-gray-300 bg-white shadow-lg rounded-lg overflow-hidden dark:bg-slate-800 dark:text-white duration-300">
          <Link to={`/detail/${hotel?._id}`}>
            <div className="relative">
              <div
                className={`${
                  isExpired() || booking.status === 'CANCELLED'
                    ? 'grayscale'
                    : ''
                }`}
              >
                <img
                  src={hotel?.imageUrls[0]}
                  alt={hotel?.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md">
                  {roomNumber?.roomNumberName}
                </div>
              </div>
              <div
                className={`absolute top-2 left-2 text-white px-2 py-1 rounded-md ${
                  isExpired() || booking.status === 'CANCELLED'
                    ? 'bg-red-500'
                    : 'bg-green-500'
                }`}
              >
                {booking.status === 'CANCELLED'
                  ? 'CANCELLED'
                  : isExpired()
                  ? 'Expired'
                  : 'Active'}
              </div>
            </div>
          </Link>
          <div className={`p-4 ${isExpired() ? 'grayscale' : ''}`}>
            <h2 className="text-xl font-bold mb-2">{hotel?.name}</h2>
            <h3 className="text-sm font-semibold line-clamp-1">
              {hotel?.address}
            </h3>
            <small>Booking ID: {booking._id}</small>
            <p className="text-gray-600 dark:text-white duration-300">
              ID & Passport:{' '}
              <span className="text-violet-600 dark:text-yellow-300 duration-300">
                {booking.citizen_id}
              </span>
            </p>
            <p className="text-gray-600 dark:text-white duration-300">
              Email:{' '}
              <span className="text-violet-600 dark:text-yellow-300 duration-300">
                {booking.email}
              </span>
            </p>
            <p className="text-gray-600 dark:text-white duration-300">
              Check-in:{' '}
              <span className="text-violet-600 dark:text-yellow-300 duration-300">
                {new Date(booking.check_in).toLocaleDateString()}
              </span>
            </p>
            <p className="text-gray-600 dark:text-white duration-300">
              Check-out:{' '}
              <span className="text-violet-600 dark:text-yellow-300 duration-300">
                {new Date(booking.check_out).toLocaleDateString()}
              </span>
            </p>
            <p className="text-gray-600 dark:text-white duration-300">
              Total Cost:{' '}
              <span className="text-violet-600 dark:text-yellow-300 duration-300">
                ฿{(booking.totalCost as any).$numberDecimal || '0'}
              </span>
            </p>
            {/* {booking.status === 'CANCELLED' && (
            <>
              <p className="text-gray-600">
                Cancelled by:{' '}
                <span className="text-violet-600">{booking.cancelledBy}</span>
              </p>
              <p className="text-gray-600">
                Cancelled at:{' '}
                <span className="text-violet-600">
                  {' '}
                  {new Date(booking.updatedAt).toLocaleString()}
                </span>
              </p>
            </>
          )} */}
            <div className="flex justify-between align-items-center items-center">
              <small className="text-neutral-900 font-semibold dark:text-sky-500 duration-300">
                Booked at: {new Date(booking.createdAt).toLocaleString()}
              </small>
              {booking.status === 'PAID' && !isExpired() ? (
                <button
                  type="button"
                  onClick={toggleCancelConfirmation}
                  className="w-1/4 md:text-[15px] bg-rose-500 text-white h-full p-1 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
          {showCancelConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
              <div className="bg-white rounded-lg p-6 text-gray-800">
                <h2 className="text-lg font-bold mb-4 ">
                  Confirm Cancellation
                </h2>
                <p>Are you sure you want to cancel this booking?</p>
                <div className="mt-4 flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-gray-600 rounded-md transition-colors ease-in duration-50"
                    onClick={toggleCancelConfirmation}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-rose-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
                    onClick={handleCancelBooking}
                    disabled={isCancellingBooking}
                  >
                    {isCancellingBooking
                      ? 'Cancelling...'
                      : 'Confirm Cancellation'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default BookingCard;
