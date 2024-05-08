import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import * as apiClient from '../api-client';
import { BsBuilding, BsMap } from 'react-icons/bs';
import {
  BiHotel,
  BiMoney,
  BiStar,
  BiTrashAlt,
  BiEditAlt,
  BiSolidBellRing,
  BiPlusCircle,
} from 'react-icons/bi';
import { useAppContext } from '../contexts/AppContext';
import { Spinner } from 'flowbite-react';

const MyHotels = () => {
  const { showToast } = useAppContext();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const toggleDeleteConfirmation = () => {
    setShowDeleteConfirmation(!showDeleteConfirmation);
  };

  const { data: hotelData, isLoading } = useQuery(
    'fetchMyHotels',
    apiClient.fetchMyHotels,
    {
      onError: () => {
        showToast({
          message: 'Error fetching hotels from this user',
          type: 'ERROR',
        });
      },
    }
  );

  const deleteHotel = async (hotelId: string) => {
    try {
      await apiClient.deleteMyHotelById(hotelId);
      showToast({ message: 'Hotel deleted successfully', type: 'SUCCESS' });
      window.location.reload();
    } catch (error) {
      showToast({ message: 'Error deleting hotel', type: 'ERROR' });
    }
  };

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
        <div className="space-y-5 md:mx-0 xs:mx-2">
          <span className="flex justify-between">
            <h1 className="text-3xl font-bold">My Hotels</h1>
            <Link
              to="/hotel-dashboard"
              className="bg-teal-400 justify-center ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-teal-500 rounded-md transition-colors ease-in duration-50"
            >
              Dash Board
            </Link>
            <Link to="/add-hotel" className="primary-btn flex items-center">
              <BiPlusCircle className="inline-block mr-2" size={25} />
              Add Hotel
            </Link>
          </span>
          <div className="grid grid-cols-1 gap-8">
            {hotelData && hotelData.length > 0 ? (
              hotelData?.map((hotel) => (
                <div
                  data-testid="hotel-card"
                  className="flex flex-col justify-between border border-slate-300 dark:bg-slate-800 dark:text-white  rounded-lg p-8 gap-5 duration-300"
                  key={hotel._id}
                >
                  <Link
                    to={`/detail/${hotel._id}`}
                    // w-2/4 bg-indigo-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50
                    className="font-bold text-xl max-w-fit hover:underline rounded-md transition-colors ease-in duration-50"
                  >
                    <h2 className="text-2xl font-bold">{hotel.name}</h2>
                  </Link>

                  <div className="line-clamp-3">
                    <div
                      dangerouslySetInnerHTML={{ __html: hotel.description }}
                    />
                  </div>
                  <div className="grid lg:grid-cols-5 gap-2 xs:grid-cols-2">
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BsMap className="mr-1" />
                      {hotel.city}, {hotel.country}
                    </div>
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BsBuilding className="mr-1" />
                      {hotel.type}
                    </div>
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BiMoney className="mr-1" /> ฿
                      {hotel.startingPrice
                        ? (hotel.startingPrice as any).$numberDecimal
                        : '0'}{' '}
                      /night
                    </div>
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BiHotel className="mr-1" />
                      {hotel.room.length} rooms,
                      <br />
                      {hotel.bookings.length} booking
                    </div>
                    <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                      <BiStar className="mr-1" />
                      {hotel.starRating ?? '0'} Star Rating
                    </div>
                  </div>
                  <span className="flex justify-end">
                    <Link
                      to={`/hotel-bookings/${hotel._id}`}
                      className="flex bg-purple-500 justify-center w-16 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-purple-600 rounded-md transition-colors ease-in duration-50"
                    >
                      <BiSolidBellRing size={25} />
                    </Link>
                    <Link
                      to={`/edit-hotel/${hotel._id}`}
                      className="flex bg-yellow-300 justify-center w-16 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-yellow-400 rounded-md transition-colors ease-in duration-50"
                    >
                      <BiEditAlt size={25} />
                    </Link>
                    <button
                      type="button"
                      className="flex bg-rose-500 justify-center w-16 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
                      onClick={toggleDeleteConfirmation}
                    >
                      <BiTrashAlt size={25} />
                    </button>
                  </span>
                  {showDeleteConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
                      <div className="bg-white rounded-lg p-6">
                        <h2 className="text-lg font-bold mb-4">
                          Confirm Delete
                        </h2>
                        <p>
                          Are you sure you want to delete this {hotel.name}{' '}
                          hotel?
                        </p>
                        <div className="mt-4 flex justify-end">
                          <button
                            className="px-4 py-2 bg-gray-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-gray-600 rounded-md transition-colors ease-in duration-50"
                            onClick={toggleDeleteConfirmation}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-rose-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
                            onClick={() => deleteHotel(hotel._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <span>You have not created any hotels!</span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyHotels;
