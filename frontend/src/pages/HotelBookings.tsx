import { useMutation, useQuery } from 'react-query';
import * as apiClient from '../api-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useSearchParams } from 'react-router-dom';
import { BookingType, RoomNumberType } from '../../../backend/src/shared/types';
import { useEffect, useState } from 'react';
import { LuMoreVertical } from 'react-icons/lu';
import PrintTableButton from '../components/PrintTableButton';

interface CustomBookingType {
  _id: string;
  firstName: string;
  lastName: string;
  check_in: string;
  check_out: string;
  roomNumberId: string;
  totalCost: number;
  citizen_id: string;
  status: string;
}

const HotelBookings = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage, setBookingsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const searchTerm = searchParams.get('search') || '';
  const filterOption = searchParams.get('filter') || '';
  const sortOption = searchParams.get('sort') || '';

  const {
    data: bookings,
    isLoading: isBookingLoading,
    isError: isBookingError,
  } = useQuery(
    'fetchHotelBookings',
    () => (hotelId ? apiClient.fetchHotelBookings(hotelId) : null),
    {
      enabled: !!hotelId,
      onError: () => {
        showToast({
          message: 'Error fetching bookings for this hotel',
          type: 'ERROR',
        });
      },
    }
  );

  const {
    data: roomNumber,
    isLoading: isRoomNumberLoading,
    isError: isRoomNumberError,
  } = useQuery<RoomNumberType[]>(
    [
      'fetchRoomNumbers',
      bookings?.map((booking: BookingType) => booking.roomNumberId),
    ],
    () =>
      Promise.all(
        bookings?.map((booking: BookingType) =>
          apiClient.fetchMyRoomNumberById(booking.roomNumberId!)
        )
      ),
    {
      enabled: !!bookings?.length,
      onError: () => {
        showToast({
          message: 'Error fetching room numbers',
          type: 'ERROR',
        });
      },
    }
  );

  const { data: hotel } = useQuery(
    'fetchHotelById',
    () => (hotelId ? apiClient.fetchHotelById(hotelId) : null),
    {
      enabled: !!hotelId,
      onError: () => {
        showToast({
          message: 'Error fetching hotel details',
          type: 'ERROR',
        });
      },
    }
  );

  const { mutate: cancelBooking, isLoading: isCancellingBooking } = useMutation<
    void,
    unknown,
    string
  >((bookingId) => apiClient.cancelMyBookingById(bookingId), {
    onSuccess: () => {
      showToast({ message: 'Booking Cancelled!', type: 'SUCCESS' });
      window.location.reload();
    },
    onError: () => {
      showToast({ message: 'Error Cancelling Booking', type: 'ERROR' });
    },
  });

  if (isBookingError || isRoomNumberError || !bookings) {
    return <div>No booking found or invalid booking ID </div>;
  }

  if (isBookingLoading || isRoomNumberLoading) {
    return <div>Loading...</div>;
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchParams(
      { search: newSearchTerm, filter: filterOption },
      { replace: true }
    );
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilterOption = event.target.value;
    setSearchParams(
      { search: searchTerm, filter: newFilterOption },
      { replace: true }
    );
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOption = event.target.value;
    setSearchParams(
      { search: searchTerm, filter: filterOption, sort: newSortOption },
      { replace: true }
    );
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const filteredBookings = bookings
    .filter((booking: CustomBookingType) => {
      const guestName =
        `${booking.firstName} ${booking.lastName}`.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();

      if (filterOption === 'checkIn') {
        const checkInDate = new Date(booking.check_in).toLocaleDateString();
        return (
          guestName.includes(searchTermLower) ||
          checkInDate.includes(searchTermLower)
        );
      } else if (filterOption === 'checkOut') {
        const checkOutDate = new Date(booking.check_out).toLocaleDateString();
        return (
          guestName.includes(searchTermLower) ||
          checkOutDate.includes(searchTermLower)
        );
      } else if (filterOption === 'citizen_id') {
        return (
          guestName.includes(searchTermLower) ||
          booking.citizen_id.includes(searchTermLower)
        );
      } else {
        return guestName.includes(searchTermLower);
      }
    })
    .filter((booking: CustomBookingType) => {
      if (startDate && endDate) {
        const checkInDate = new Date(booking.check_in);
        const checkOutDate = new Date(booking.check_out);
        const selectedStartDate = new Date(startDate);
        const selectedEndDate = new Date(endDate);

        return (
          checkInDate >= selectedStartDate && checkOutDate <= selectedEndDate
        );
      }
      return true;
    })
    .sort((a: CustomBookingType, b: CustomBookingType) => {
      if (sortOption === 'checkIn') {
        return new Date(a.check_in).getTime() - new Date(b.check_in).getTime();
      } else if (sortOption === 'checkOut') {
        return (
          new Date(a.check_out).getTime() - new Date(b.check_out).getTime()
        );
      } else if (sortOption === 'guestName') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortOption === 'totalCost') {
        return a.totalCost - b.totalCost;
      } else if (sortOption === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleActionClick = (bookingId: string) => {
    setSelectedBookingId((prevId) => (prevId === bookingId ? null : bookingId));
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId);
    setSelectedBookingId(null);
  };

  const handleViewBooking = (bookingId: string) => {
    navigate(`/booking-details/${bookingId}`);
    setSelectedBookingId(null);
  };

  const roomNumbersMap = roomNumber?.reduce((acc, room) => {
    acc[room._id] = room.roomNumberName;
    return acc;
  }, {} as { [key: string]: string });

  const dateRange =
    startDate && endDate
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(
          endDate
        ).toLocaleDateString()}`
      : 'All';

  return (
    <div className="space-y-5 overflow-x-scroll xs:px-2 md:px-0">
      <h1 className="text-3xl font-bold sticky left-0">Hotel Bookings</h1>
      <PrintTableButton
        currentBookings={currentBookings}
        roomNumbersMap={roomNumbersMap}
        hotelName={hotel?.name || ''}
        dateRange={dateRange}
      />
      {/* ------------------- Search ------------------- */}
      <div className="grid justify-between mb-4 sticky left-0 gap-4 xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 dark:bg-slate-800 rounded-lg p-4">
        <div className="flex items-center">
          <label htmlFor="search" className="mr-2 dark:text-white">
            Search name:
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-400 px-2 py-1 rounded"
          />
        </div>

        {/* ------------------- Filter By ------------------- */}
        <div className="flex items-center">
          <label htmlFor="filter" className="mr-2 dark:text-white">
            Filter by:
          </label>
          <select
            id="filter"
            value={filterOption}
            onChange={handleFilterChange}
            className="border border-gray-400 px-2 py-1 rounded"
          >
            <option value="">None</option>
            <option value="checkIn">Check-In Date</option>
            <option value="checkOut">Check-Out Date</option>
            <option value="citizen_id">Citizen ID</option>
          </select>
        </div>

        {/* ------------------- Sort ------------------- */}
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 dark:text-white">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortOption}
            onChange={handleSortChange}
            className="border border-gray-400 px-2 py-1 rounded"
          >
            <option value="">None</option>
            <option value="checkIn">Check-In Date</option>
            <option value="checkOut">Check-Out Date</option>
            <option value="guestName">Guest Name</option>
            <option value="totalCost">Total Cost</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* ------------------- Date Range ------------------- */}
        <div className="flex items-center">
          <label htmlFor="startDate" className="mr-2 dark:text-white">
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
            className="border border-gray-400 px-2 py-1 rounded"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="endDate" className="ml-2 mr-2 dark:text-white">
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
            className="border border-gray-400 px-2 py-1 rounded"
          />
        </div>

        {/* ------------------- Bookings per Page ------------------- */}
        <div className="flex items-center">
          <label htmlFor="bookingsPerPage" className="mr-2 dark:text-white">
            Bookings per page:
          </label>
          <select
            id="bookingsPerPage"
            value={bookingsPerPage}
            onChange={(e) => setBookingsPerPage(Number(e.target.value))}
            className="border border-gray-400 px-2 py-1 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      <table className="w-full border-collapse dark:bg-slate-800 dark:text-white">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-gray-400 dark:text-zinc-800">Booking ID</th>
            <th className="border border-gray-400 dark:text-zinc-800 p-2">Guest Name</th>
            <th className="border border-gray-400 dark:text-zinc-800 p-2">Room Name</th>
            <th className="border border-gray-400 dark:text-zinc-800 p-2 whitespace-nowrap">Check-In Date</th>
            <th className="border border-gray-400 dark:text-zinc-800 p-2 whitespace-nowrap">Check-Out Date</th>
            <th className="border border-gray-400 dark:text-zinc-800 p-2">Citizen ID</th>
            <th className="border border-gray-400 dark:text-zinc-800 p-2">Total Cost</th>
            <th className="border border-gray-400 dark:text-zinc-800 p-2">Status</th>
            <th className="border border-gray-400 dark:text-zinc-800">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.length === 0 ? (
            <div className="italic text-red-500">No booking found!</div>
          ) : (
            currentBookings.map((booking: BookingType) => (
              <tr key={booking._id} className="even:bg-gray-100 dark:even:bg-slate-600">
                <td className="border border-gray-400 p-2">{booking._id}</td>
                <td className="border border-gray-400 p-2">{`${booking.firstName} ${booking.lastName}`}</td>
                <td className="border border-gray-400 p-2">
                  {roomNumbersMap
                    ? roomNumbersMap[booking.roomNumberId]
                    : 'ERROR!'}
                </td>
                <td className="border border-gray-400 p-2">
                  {new Date(booking.check_in).toLocaleDateString()}
                </td>
                <td className="border border-gray-400 p-2">
                  {new Date(booking.check_out).toLocaleDateString()}
                </td>
                <td className="border border-gray-400 p-2">
                  {booking.citizen_id}
                </td>
                <td className="border border-gray-400 p-2">
                  ฿{(booking.totalCost as any).$numberDecimal || '0'}
                </td>
                <td className="border border-gray-400 p-2 font-bold text-white">
                  <span
                    className={
                      booking.status === 'PAID'
                        ? 'bg-green-500 p-1 rounded-md'
                        : 'bg-red-500 p-1 rounded-md'
                    }
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="border border-gray-400 text-center relative">
                  <button
                    onClick={() => handleActionClick(booking._id)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <LuMoreVertical />
                  </button>
                  {selectedBookingId === booking._id && (
                    <div className="absolute right-0 mt-2 w-40 bg-green-200 border border-gray-300 rounded shadow-md z-10">
                      <button
                        onClick={() => handleViewBooking(booking._id)}
                        className="block w-full text-left px-4 py-2 hover:bg-green-300 dark:text-zinc-800"
                      >
                        View
                      </button>
                      {booking.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="block w-full text-left px-4 py-2 hover:bg-red-300 bg-red-200 dark:text-zinc-800" 
                          disabled={isCancellingBooking}
                        >
                          {isCancellingBooking ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination
        bookingsPerPage={bookingsPerPage}
        totalBookings={filteredBookings.length}
        paginate={paginate}
        currentPage={currentPage}
        sortOption={sortOption}
      />
    </div>
  );
};

const Pagination = ({
  bookingsPerPage,
  totalBookings,
  paginate,
  currentPage,
  sortOption,
}: {
  bookingsPerPage: number;
  totalBookings: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
  sortOption: string;
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalBookings / bookingsPerPage); i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    paginate(1); // Reset to the first page when the sorting option changes
  }, [sortOption]);

  useEffect(() => {
    paginate(1); // Reset to the first page when the bookings per page changes
  }, [bookingsPerPage]);

  return (
    <nav className="sticky left-0">
      <ul className="pagination flex space-x-2 mb-2">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <button
              onClick={() => paginate(number)}
              className={`page-link px-3 py-1 rounded ${
                currentPage === number
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-500 border border-slate-500'
              }`}
            >
              {number}
            </button>{' '}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HotelBookings;
