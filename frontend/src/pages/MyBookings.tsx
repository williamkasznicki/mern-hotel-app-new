import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import BookingCard from '../components/BookingCard';

const MyBookings = () => {
  const { data: bookings } = useQuery(
    'fetchMyBookings',
    apiClient.fetchMyBookings
  );

  if (!bookings || bookings.length === 0) {
    return  <h1 className="text-2xl font-bold italic">No bookings has been made!</h1>
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <BookingCard key={booking._id} booking={booking} />
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
