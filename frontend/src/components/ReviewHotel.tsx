import React from 'react';
import { AiFillStar } from 'react-icons/ai';
import { useMutation, useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { useAppContext } from '../contexts/AppContext';
import * as apiClient from '../api-client';

type Props = {
  hotelId: string;
};

type ReviewFormData = {
  starRating: number;
  comment: string;
};

const ReviewHotel: React.FC<Props> = ({ hotelId }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>();

  const starRating = watch('starRating');

  const { showToast } = useAppContext();

  const { data: bookings } = useQuery(
    'fetchMyBookings',
    apiClient.fetchMyBookings
  );

  const isBooked = bookings?.some(
    (booking) =>
      booking.hotelId === hotelId && new Date() > new Date(booking.check_out)
  );

  const { data: reviews } = useQuery(
    ['hotelReviews', hotelId],
    () => apiClient.fetchHotelReviews(hotelId),
    {
      enabled: !!hotelId,
    }
  );
  const hasReviewed = reviews?.reviews.some(
    (review) => review.userId === bookings?.[0]?.userId
  );

  const { mutate: createReview, isLoading: isCreatingReview } = useMutation(
    (reviewData: FormData) => apiClient.createReview(hotelId, reviewData),
    {
      onSuccess: () => {
        window.location.reload();
        reset(); // Reset the form after successful submission
      },
      onError: () => {
        showToast({ message: 'Error creating review', type: 'ERROR' });
      },
    }
  );

  const onSubmit = (data: ReviewFormData) => {
    if (data.starRating === 0) {
      // Display an error message or handle the case when no star rating is selected

      alert('No star rating selected');
      return;
    }

    const reviewData = new FormData();
    reviewData.append('starRating', data.starRating.toString());
    reviewData.append('comment', data.comment);

    createReview(reviewData);
  };

  return (
    <div className="mt-8">
      {isBooked ? (
        hasReviewed ? (
          <p className="text-gray-700">You can only leave one review.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className="cursor-pointer">
                  <input
                    type="radio"
                    value={rating}
                    className="hidden"
                    {...register('starRating', {
                      required: 'star need to be selected',
                    })}
                  />
                  <AiFillStar
                    className={`text-2xl ${
                      rating <= (Number(starRating) || 0)
                        ? 'text-yellow-300'
                        : 'text-gray-400'
                    }`}
                  />
                </label>
              ))}
              {errors.starRating && (
                <span className="text-red-500">
                  {errors.starRating.message}
                </span>
              )}
            </div>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
              maxLength={500}
              placeholder="Leave your review or let us know how yours expereince ..."
              {...register('comment', {
                required: 'this comment is required',
                maxLength: 500,
              })}
            />
            {errors.comment && (
              <span className="text-red-500">{errors.comment.message}</span>
            )}
            <button
              className="block primary-btn mt-2"
              type="submit"
              disabled={isCreatingReview}
            >
              {isCreatingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )
      ) : (
        <p className="text-gray-700 text-sm italic font-thin">
          You need to book this hotel first to leave a review.
        </p>
      )}
    </div>
  );
};

export default ReviewHotel;
