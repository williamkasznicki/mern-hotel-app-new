import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import BookingForm from '../forms/BookingForm/BookingForm';
import { useSearchContext } from '../contexts/SearchContext';
import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BookingDetailsSummary from '../components/BookingDetailsSummary';
import { Elements } from '@stripe/react-stripe-js';
import { useAppContext } from '../contexts/AppContext';

const Booking = () => {
  const { stripePromise } = useAppContext();
  const { hotelId, roomId } = useParams();
  const [numberOfNights, setNumberOfNights] = useState<number>(0);
  const { showToast } = useAppContext();

  const location = useLocation();
  const roomImageUrls: string[] = location.state?.roomImageUrls || [];

  const search = useSearchContext();

  useEffect(() => {
    if (search.checkIn && search.checkOut) {
      const nights =
        Math.abs(search.checkOut.getTime() - search.checkIn.getTime()) /
        (1000 * 60 * 60 * 24);

      setNumberOfNights(Math.ceil(nights));
    }
  }, [search.checkIn, search.checkOut]);

  const { data: hotel } = useQuery(
    'fetchHotelByID',
    () => apiClient.fetchHotelById(hotelId as string),
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

  const { data: room } = useQuery(
    'fetchMyRoomById',
    () => apiClient.fetchMyRoomById(roomId! as string),
    {
      enabled: !!roomId,
      onError: () => {
        showToast({
          message: 'Error fetching room details',
          type: 'ERROR',
        });
      },
    }
  );

  const { data: paymentIntentData, isLoading: paymentIntentLoading } = useQuery(
    'createPaymentIntent',
    () =>
      apiClient.createPaymentIntent(
        hotelId as string,
        numberOfNights.toString(),
        room?.roomType || '',
        search.checkIn.toISOString(),
        search.checkOut.toISOString()
      ),
    {
      enabled: !!hotelId && numberOfNights > 0 && !!room,
      // onError: () => {
      //   showToast({
      //     message: 'Preparing paymentIntent',
      //     type: 'WARNING',
      //   });
      // },
    }
  );

  const { data: currentUser } = useQuery(
    'fetchCurrentUser',
    apiClient.fetchCurrentUser,
    {
      onError: () => {
        showToast({
          message: 'Error getting current user',
          type: 'ERROR',
        });
      },
    }
  );

  if (!hotel) {
    return <></>;
  }

  return (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Room Images</h3>
        <div className="grid grid-cols-3 gap-4">
          {roomImageUrls.map((imageUrl, index) => (
            <div key={index} className="w-full lg:h-48">
              <img
                src={imageUrl}
                alt={`Room Image ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-[1fr_2fr] gap-4">
        <BookingDetailsSummary
          checkIn={search.checkIn}
          checkOut={search.checkOut}
          adultCount={search.adultCount}
          childCount={search.childCount}
          numberOfNights={numberOfNights}
          roomType={room?.roomType}
          hotel={hotel}
        />
        {currentUser && !paymentIntentLoading && paymentIntentData && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: paymentIntentData.clientSecret,
            }}
          >
            <BookingForm
              currentUser={currentUser}
              paymentIntent={paymentIntentData}
            />
          </Elements>
        )}
      </div>
    </>
  );
};

export default Booking;
