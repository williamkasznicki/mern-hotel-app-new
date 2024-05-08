import { useEffect, useState } from 'react';
import * as apiClient from '../../api-client';
import { useThemeMode } from 'flowbite-react';

type SidebarProps = {
  onButtonClick: (buttonName: string) => void;
};

const Dashboard = ({ onButtonClick }: SidebarProps) => {
  const [userCount, setUserCount] = useState(0);
  const [hotelCount, setHotelCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  const { mode } = useThemeMode();

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const counts = await apiClient.getDashboardCounts();
      setUserCount(counts.userCount);
      setHotelCount(counts.hotelCount);
      setRoomCount(counts.roomCount);
      setReviewCount(counts.reviewCount);
      setBookingCount(counts.bookingCount);
    } catch (error) {
      console.log('Error fetching dashboard counts:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 mt-2">
      <div
        className={`rounded-lg shadow-md p-6 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer ${
          mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        <h3 className="text-xl font-semibold mb-2">Users</h3>
        <p className="text-3xl font-bold mb-4">{userCount}</p>
        <button
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => onButtonClick('users')}
        >
          View Users
        </button>
      </div>
      <div
        className={`rounded-lg shadow-md p-6 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer ${
          mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        <h3 className="text-xl font-semibold mb-2">Hotels</h3>
        <p className="text-3xl font-bold mb-4">{hotelCount}</p>
        <button
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => onButtonClick('hotels')}
        >
          View Hotels
        </button>
      </div>
      <div
        className={`rounded-lg shadow-md p-6 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer ${
          mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        <h3 className="text-xl font-semibold mb-2">Rooms</h3>
        <p className="text-3xl font-bold mb-4">{roomCount}</p>
        <button
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => onButtonClick('rooms')}
        >
          View Rooms
        </button>
      </div>
      <div
        className={`rounded-lg shadow-md p-6 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer ${
          mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
        <p className="text-3xl font-bold mb-4">{reviewCount}</p>
        <button
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => onButtonClick('reviews')}
        >
          View Reviews
        </button>
      </div>
      <div
        className={`rounded-lg shadow-md p-6 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer ${
          mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
        }`}
      >
        <h3 className="text-xl font-semibold mb-2">Bookings</h3>
        <p className="text-3xl font-bold mb-4">{bookingCount}</p>
        <button
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => onButtonClick('bookings')}
        >
          View Bookings
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
