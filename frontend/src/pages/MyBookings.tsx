import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import BookingCard from '../components/BookingCard';
import { Spinner } from 'flowbite-react';

const MyBookings = () => {
  const { data: bookings, isLoading } = useQuery(
    'fetchMyBookings',
    apiClient.fetchMyBookings
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookings?.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;
