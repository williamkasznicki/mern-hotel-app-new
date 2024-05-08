import * as apiClient from '../api-client';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ReviewType } from '../../../backend/src/shared/types';
import { AiFillStar } from 'react-icons/ai';
import { MdOutlineReviews } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import { CiEdit } from 'react-icons/ci';

type Props = {
  hotelId: string;
};

export interface HotelReviewsResponse {
  reviews: ReviewType[];
  ratingCounts: { _id: number; count: number }[];
}

const HotelReviews: React.FC<Props> = ({ hotelId }) => {
  const { showToast } = useAppContext();
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewType | null>(null);
  const [deleteConfirmationReviewId, setDeleteConfirmationReviewId] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();

  const { data } = useQuery(
    'fetchHotelReviews',
    () => apiClient.fetchHotelReviews(hotelId),
    {
      enabled: !!hotelId,
      onError: () => {
        showToast({
          message: 'Error fetching reviews for this hotel',
          type: 'ERROR',
        });
      },
    }
  );

  const { data: user } = useQuery(
    'fetchCurrentUser',
    () => apiClient.fetchCurrentUser(),
    {
      onError: () => {
       console.log("Error fetching current user");
      },
    }
  );

  const { mutate: updateReviewMutation } = useMutation(
    (reviewData: FormData) =>
      apiClient.updateMyReviewById(editingReview!._id, reviewData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('fetchHotelReviews');
        setEditingReview(null);
        showToast({
          message: 'Review updated successfully',
          type: 'SUCCESS',
        });
      },
      onError: () => {
        showToast({ message: 'Error updating review', type: 'ERROR' });
      },
    }
  );

  const reviews = filterRating
    ? data?.reviews.filter((review) => review.starRating === filterRating)
    : data?.reviews;
  const ratingCounts = data?.ratingCounts || [];

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.starRating,
      0
    );
    const averageRating = totalRating / reviews.length;
    return Math.round(averageRating * 10) / 10;
  };

  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await apiClient.deleteMyReviewById(reviewId);
      queryClient.invalidateQueries('fetchHotelReviews');
      showToast({
        message: 'Review deleted successfully',
        type: 'SUCCESS',
      });
    } catch (error) {
      showToast({ message: 'Error deleting review', type: 'ERROR' });
    }
  };

  const openEditModal = (review: ReviewType) => {
    setEditingReview(review);
  };

  const closeEditModal = () => {
    setEditingReview(null);
  };

  const handleUpdateReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    updateReviewMutation(formData);
  };

  const openDeleteConfirmationModal = (reviewId: string) => {
    setDeleteConfirmationReviewId(reviewId);
  };

  const closeDeleteConfirmationModal = () => {
    setDeleteConfirmationReviewId(null);
  };

  const confirmDeleteReview = () => {
    if (deleteConfirmationReviewId) {
      deleteReview(deleteConfirmationReviewId);
      closeDeleteConfirmationModal();
    }
  };

  return (
    <div className="mt-2">
      <h2 className="text-2xl font-bold mb-4">
        Reviews <MdOutlineReviews className="inline ml-1" size={24} />{' '} 
      </h2>
      <div className="mb-4 bg-amber-50 dark:bg-slate-800 dark:text-gray-200 p-5 flex justify-between duration-300">
        <div className="flex items-center">
          {Array.from({ length: calculateAverageRating() }).map((_, index) => (
            <AiFillStar key={index} className="text-yellow-300" />
          ))}
          <span className="ml-2 font-bold text-1xl">
            {calculateAverageRating()} out of 5
          </span>
        </div>
        <div>
          <button
            className={`mr-2 px-3 py-2 bg-black text-white border-2 hover:text-emerald-400 focus:text-emerald-400 active:scale-95 rounded-sm ${
              filterRating === null ? 'font-bold' : 'font-bold'
            }`}
            onClick={() => handleFilterChange(null)}
          >
            All ({data?.reviews.length})
          </button>
          {ratingCounts.map((rc) => (
            <button
              key={rc._id}
              className={`mr-2 bg-white px-3 py-2 border-2 hover:border-red-400 focus:border-red-400 focus:text-red-500 active:scale-95 dark:text-zinc-700 dark:focus:text-red-500 rounded-sm duration-300 ${
                filterRating === rc._id ? 'font-bold' : 'font-bold'
              }`}
              onClick={() => handleFilterChange(rc._id)}
            >
              {rc._id} stars ({rc.count})
            </button>
          ))}
        </div>
      </div>
      {reviews?.map((review) => (
        <div
          key={review._id}
          className="grid grid-cols-2 border-b border-gray-200 pb-4 mb-4  dark:bg-zinc-100 p-2 rounded-sm duration-300"
        >
          <div className="grid grid-cols-1 mb-">
            <div className="flex">
              {Array.from({ length: review.starRating }).map((_, index) => (
                <AiFillStar key={index} className="text-yellow-300" />
              ))}
            </div>
            <p>{review.comment}</p>
            <p className="text-sm text-gray-500">
              By {review.userName} on{' '}
              {new Date(review.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            {review.userId === user?._id && (
              <>
                <FaRegTrashAlt
                  className="fill-red-500 float-right cursor-pointer"
                  size={24}
                  onClick={() => openDeleteConfirmationModal(review._id)}
                />
                <CiEdit
                  className="fill-amber-500 float-right cursor-pointer mr-2"
                  size={24}
                  onClick={() => openEditModal(review)}
                />
              </>
            )}
          </div>
        </div>
      ))}

      {editingReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Review</h2>
            <form onSubmit={handleUpdateReview}>
              <div className="mb-4">
                <label htmlFor="starRating" className="block mb-2">
                  Rating
                </label>
                <select
                  id="starRating"
                  name="starRating"
                  defaultValue={editingReview.starRating}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} stars
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block mb-2">
                  Comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  defaultValue={editingReview.comment}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                  maxLength={500}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500  hover:bg-indigo-600 text-white rounded"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmationReviewId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this review?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={closeDeleteConfirmationModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded ml-2"
                onClick={confirmDeleteReview}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelReviews;
