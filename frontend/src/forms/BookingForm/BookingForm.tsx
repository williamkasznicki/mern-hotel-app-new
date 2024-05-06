import { useForm } from 'react-hook-form';
import {
  PaymentIntentResponse,
  UserType,
} from '../../../../backend/src/shared/types';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { useSearchContext } from '../../contexts/SearchContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import * as apiClient from '../../api-client';
import { useAppContext } from '../../contexts/AppContext';

type Props = {
  currentUser: UserType;
  paymentIntent: PaymentIntentResponse;
};

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: string;
  checkOut: string;
  hotelId: string;
  roomType: string;
  citizen_id: string;
  phone: string;
  status: string;
  paymentIntentId: string;
  totalCost: number;
};

const BookingForm = ({ currentUser, paymentIntent }: Props) => {
  const stripe = useStripe();
  const elements = useElements();

  const Navigate = useNavigate();

  const search = useSearchContext();
  const { hotelId, roomId } = useParams();

  const { showToast } = useAppContext();

  const { mutate: bookRoom, isLoading } = useMutation(
    apiClient.createRoomBooking,
    {
      onSuccess: () => {
        showToast({ message: 'Booking Saved!', type: 'SUCCESS' });
        Navigate('/my-bookings');
      },
      onError: () => {
        showToast({ message: 'Error saving booking', type: 'ERROR' });
      },
    }
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      phone: currentUser.phone,
      email: currentUser.email,
      adultCount: search.adultCount,
      childCount: search.childCount,
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      hotelId: hotelId,
      roomType: roomId,
      status: 'PAID',
      citizen_id: '',
      totalCost: paymentIntent.totalCost,
      paymentIntentId: paymentIntent.paymentIntentId,
    },
  });

  const onSubmit = async (formData: BookingFormData) => {
    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement) as StripeCardElement,
      },
    });

    if (result.paymentIntent?.status === 'succeeded') {
      console.log('paymentIntent', result.paymentIntent);
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      // console.log({
      //   ...formData,
      //   checkIn: checkInDate.toISOString(),
      //   checkOut: checkOutDate.toISOString(),
      // });
      bookRoom({
        ...formData,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        paymentIntentId: result.paymentIntent.id,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-5 rounded-lg border border-slate-300 p-5 dark:bg-slate-800 dark:text-white"
    >
      <span className="text-3xl font-bold">Confirm Your Details</span>
      <div className="grid grid-cols-2 gap-6">
        <label className="text-gray-700 dark:text-white text-sm font-bold flex-1">
          First Name
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register('firstName')}
          />
        </label>
        <label className="text-gray-700 dark:text-white text-sm font-bold flex-1">
          Last Name
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register('lastName')}
          />
        </label>
        <label className="text-gray-700 dark:text-white text-sm font-bold flex-1">
          Email
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register('email')}
          />
        </label>
        <label className="text-gray-700 dark:text-white text-sm font-bold flex-1">
          Phone
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 font-normal"
            type="text"
            readOnly
            disabled
            {...register('phone')}
          />
        </label>

        <label className="text-gray-700 dark:text-white text-sm font-bold flex-1">
          Citizen ID & Passport ID
          <input
            className="mt-1 border rounded w-full py-2 px-3 text-gray-700 font-normal"
            type="text"
            {...register('citizen_id', {
              required: 'Citizen ID is required',
              maxLength: {
                value: 20,
                message: 'Maximum 20 characters!',
              },
            })}
          />
          {errors.citizen_id && (
            <span className="text-red-500">{errors.citizen_id.message}</span>
          )}
        </label>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Your Price Summary</h2>

        <div className="bg-sky-200 dark:text-gray-800 p-4 rounded-md">
          <div className="font-semibold text-lg">
            Total Cost: ฿{paymentIntent.totalCost.toFixed(2)}
          </div>
          <div className="text-xs">Includes taxes and charges</div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold"> Payment Details</h3>
        <CardElement
          id="payment-element"
          className="border rounded-md p-2 text-sm dark:bg-white"
        />
      </div>

      <div className="flex justify-end">
        <button
          disabled={isLoading}
          type="submit"
          className="rounded-md bg-indigo-500 text-white p-2 font-bold hover:bg-indigo-600 text-md disabled:bg-gray-500 transition-color ease-out duration-100"
        >
          {isLoading ? 'Saving...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
