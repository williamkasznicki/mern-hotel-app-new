import { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import * as apiClient from './../api-client';
import {
  AiFillStar,
  AiFillCloseCircle,
  AiFillEnvironment,
} from 'react-icons/ai';
import GuestInfoForm from '../forms/GuestInfoForm/GuestInfoForm';
import { useSearchContext } from '../contexts/SearchContext';
import Modal from 'react-modal';
import ReviewHotel from '../components/ReviewHotel';
import HotelReviews from '../components/HotelReviews';
import { RoomType } from '../../../backend/src/shared/types';
import {
  BsFillArrowLeftSquareFill,
  BsFillArrowRightSquareFill,
} from 'react-icons/bs';
import { GiPathDistance } from 'react-icons/gi';
import { MdOutlineSportsTennis, MdOutlineDescription } from 'react-icons/md';

const Detail = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoomsAvailable, setIsRoomsAvailable] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const search = useSearchContext();
  const navigate = useNavigate();

  const handleThumbnailClick = (index: number) => {
    setCurrentSlide(index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { data: hotel } = useQuery(
    'fetchHotelById',
    () => apiClient.fetchHotelById(hotelId!),
    {
      enabled: !!hotelId,
    }
  );

  const { data: availableRooms } = useQuery(
    ['availableRooms', hotelId, search.checkIn, search.checkOut],
    () =>
      apiClient.fetchAvailableRooms(hotelId!, search.checkIn, search.checkOut),
    {
      enabled: !!hotelId && !!search.checkIn && !!search.checkOut,
      onSuccess: (data) => {
        const roomsWithAvailableNumbers = data.filter((room) =>
          room.roomNumbers.some((roomNumber) => !roomNumber.isOutOfService)
        );
        setIsRoomsAvailable(roomsWithAvailableNumbers.length > 0);
      },
    }
  );

  const handleRoomSelect = async (room: RoomType) => {
    if (
      search.adultCount > room.maxAdult ||
      search.childCount > room.maxChild
    ) {
      alert(
        'Accommodate the number of guests!   Please choose another room or decrease the number of guests'
      );
      return;
    }

    search.saveSearchValues(
      search.destination,
      search.checkIn,
      search.checkOut,
      search.adultCount,
      search.childCount,
      search.roomId,
      search.roomNumberName
    );

    closeModal();
    const roomId = room._id;
    const roomImageUrls = room.imageUrls;
    navigate(`/hotel/${hotelId}/booking/${roomId}`, {
      state: { roomImageUrls },
    });
  };

  const goToNextSlide = () => {
    const nextSlide = (currentSlide + 1) % (hotel?.imageUrls?.length || 0);
    setCurrentSlide(nextSlide);
  };

  const goToPrevSlide = () => {
    const prevSlide =
      currentSlide === 0
        ? (hotel?.imageUrls?.length || 0) - 1
        : currentSlide - 1;
    setCurrentSlide(prevSlide);
  };

  if (!hotel) {
    return <div>Something went wrong! No hotel found.</div>;
  }

  if (!availableRooms) {
    return (
      <div>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
        <span>
          No available room at the moment, please try select another Date...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-7 md:space-x-0 xs:space-x-4">
      <div>
        <span className="flex">
          {hotel.starRating
            ? Array.from({ length: hotel.starRating }).map((_, index) => (
                <AiFillStar key={index} className="fill-yellow-300" />
              ))
            : Array.from({ length: 5 }).map((_, index) => (
                <AiFillStar key={index} className="fill-gray-400" />
              ))}
        </span>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
        <h1 className="mt-1">
          <AiFillEnvironment className="fill-red-500 text-xl inline mr-1" />
          {hotel.address}
          <a
            className="ml-2 text-xs underline text-red-700"
            href={`https://www.google.com/maps/place/${hotel.coordinate[0]},${hotel.coordinate[1]}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Show on Google Map
          </a>
        </h1>
      </div>

      <div className="relative ">
        <div className='max-h-[100vh]'>
          {hotel?.imageUrls?.map((image, index) => (
            <div
              key={index}
              className={`${
                index === currentSlide ? 'block' : 'hidden'
              } w-4/5 h-full mx-auto transition-opacity duration-500`}
            >
              <img
                key={index}
                src={image}
                alt={hotel.name}
                className="rounded-md w-full h-full object-cover object-center min-h-[500px] max-h-[500px]"
              />
            </div>
          ))}
        </div>

        <button
          onClick={goToPrevSlide}
          className="absolute top-1/2 left-2 transform -translate-y-1/2"
        >
          <BsFillArrowLeftSquareFill className="fill-black text-5xl" />
        </button>
        <button
          onClick={goToNextSlide}
          className="absolute top-1/2 right-2 transform -translate-y-1/2"
        >
          <BsFillArrowRightSquareFill className="fill-black text-5xl" />
        </button>
      </div>

      <div className="flex overflow-x-auto py-2">
        {hotel?.imageUrls?.map((image, index) => (
          <div
            key={index}
            className={`flex-shrink-0 mx-2 cursor-pointer border-4 rounded-sm ${
              index === currentSlide ? 'border-zinc-700' : 'border-transparent'
            } relative`}
            onClick={() => handleThumbnailClick(index)}
          >
            <div className="w-full h-20 overflow-hidden">
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index}`}
                className="w-full h-20 object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      <h4 className="text-2xl font-semibold">
        Facilities{' '}
        <MdOutlineSportsTennis className="inline" fill={''} size={24} />
      </h4>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {hotel.allFacilities.map((facility, index) => (
          <div
            key={`${facility}-${index}`}
            className="border border-slate-300 dark:bg-slate-800 dark:text-white rounded-sm p-3"
          >
            {facility}
          </div>
        ))}
      </div>

      <h4 className="text-2xl font-semibold]">
        Landmarks <GiPathDistance className="inline ml-2" fill={''} size={24} />
      </h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 text-white px-2">
        {hotel.landmarks.map((landmark, index) => (
          <>
            <div
              key={`${landmark}-${index}`}
              className="border-2 bg-[#2a283a] dark:bg-slate-800 rounded-full p-3 px-4"
            >
              {landmark.name}
              <span className="float-right">{landmark.distance} km.</span>
            </div>
          </>
        ))}
      </div>

      <h4 className="text-2xl font-semibold">
        Description <MdOutlineDescription className="inline" size={24} />
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div
          className="p-4 whitespace-pre-line dark:bg-slate-800 rounded-md dark:text-gray-200 "
          dangerouslySetInnerHTML={{ __html: hotel.description }}
        ></div>
        <div className="h-fit">
          <GuestInfoForm
            startingPrice={hotel.startingPrice}
            onBookNowClick={openModal}
            isRoomsAvailable={isRoomsAvailable}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center w-3/4 justify-center z-50 text-white m-auto"
        contentLabel="Room Selection"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        ariaHideApp={false}
      >
        <div className="grid grid-cols-1 bg-slate-800 rounded-lg shadow-lg py-10 md:px-7 overflow-y-scroll max-h-[80vh]">
          <button className="mb-4 text-4xl sticky top-0" onClick={closeModal}>
            <AiFillCloseCircle
              className="fill-white hover:fill-red-400 z-51 float-right"
              size={40}
            />
          </button>

          <h2 className="text-2xl font-bold mb-4">Select Room</h2>
          {availableRooms
            ?.filter((room) =>
              room.roomNumbers.some((roomNumber) => !roomNumber.isOutOfService)
            )
            .map((room) => (
              <div
                key={room._id}
                className="cursor-pointer hover:bg-slate-700 w-full flex justify-between items-start p-2 mb-5"
                onClick={() => handleRoomSelect(room)}
              >
                <div className="mr-10 grid grid-cols-1 xs:w-full md:grid-cols-2 gap-4 border-b">
                  <div>
                    <h3 className="text-lg font-semibold text-fuchsia-300">
                      {room.roomType}
                    </h3>
                    <p className="line-clamp-6 mb-2">{room.description}</p>
                    <p className="font-semibold">
                      • Price per night:{' '}
                      <span className="text-emerald-300">
                        ${room.pricePerNight}
                      </span>
                    </p>
                    <p>
                      • Max Adults: {room.maxAdult} | Max Children:{' '}
                      {room.maxChild}
                    </p>
                    {room.roomFacilities && room.roomFacilities.length > 0 ? (
                      <div className="grid xs:grid-cols-3 xl:grid-cols-4 gap-2 mt-2">
                        {room.roomFacilities.map((facility, index) => (
                          <span
                            key={index}
                            className="text-sm border bg-slate-600 rounded-sm p-1 whitespace-nowrap truncate"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white">
                        No facilities available.
                      </p>
                    )}
                  </div>
                  {Array.isArray(room.imageUrls) &&
                    room.imageUrls.length > 0 && (
                      <div className="">
                        <img
                          src={room.imageUrls[0]}
                          alt={room.roomType}
                          className="h-full max-w-3xl w-full object-cover rounded "
                        />
                      </div>
                    )}
                </div>
              </div>
            ))}
        </div>
      </Modal>

      <ReviewHotel hotelId={hotelId!} />
      <HotelReviews hotelId={hotelId!} />
    </div>
  );
};

export default Detail;
