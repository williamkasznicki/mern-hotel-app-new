import { useState } from 'react';
import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import BookingCard from '../components/BookingCard';
import { Spinner } from 'flowbite-react';
import { BookingType } from '../../../backend/src/shared/types';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('active');

  const { data: bookings, isLoading } = useQuery(
    'fetchMyBookings',
    apiClient.fetchMyBookings
  );

  const isExpired = (booking: BookingType) => {
    const today = new Date();
    const checkOutDate = new Date(booking.check_out);
    return today > checkOutDate;
  };

  const filteredBookings = bookings?.filter((booking: BookingType) => {
    if (activeTab === 'active') {
      return booking.status === 'PAID' && !isExpired(booking);
    } else if (activeTab === 'cancelled') {
      return booking.status === 'CANCELLED';
    } else if (activeTab === 'expired') {
      return isExpired(booking);
    }
  });

  return (
    <>
      {isLoading ? (
        <Spinner
          color="purple"
          aria-label="Purple spinner"
          size={'xl'}
          className="mx-auto"
        />
      ) : (
        <div className="space-y-5">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 ${
                activeTab === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              } rounded-md`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'cancelled'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              } rounded-md`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'expired'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              } rounded-md`}
              onClick={() => setActiveTab('expired')}
            >
              Expired
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBookings?.map((booking: BookingType) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;