import { RegisterFormData } from './pages/Register';
import { SignInFormData } from './pages/SignIn';
import {
  HotelSearchResponse,
  HotelType,
  RoomType,
  PaymentIntentResponse,
  UserType,
  RoomNumberType,
  BookingType,
  ReviewType,
  DashboardDataType,
} from '../../backend/src/shared/types';
import { BookingFormData } from './forms/BookingForm/BookingForm';
import { EditProfileFormData } from './pages/ViewProfile';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/* **********************************************************************
 *                            User API
 ********************************************************************** */
export const fetchCurrentUser = async (): Promise<UserType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Error fetching user');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchUserById = async (userId: string): Promise<UserType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Error fetching user');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const register = async (formData: RegisterFormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      throw new Error(responseBody.message);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const signIn = async (formData: SignInFormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData.message ', errorData.message);
      throw new Error(errorData.message || 'Failed to Signin');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const verifyToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData.message ', errorData.message);
      throw new Error(errorData.message || 'Token not valid');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const signOut = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      credentials: 'include',
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData.message ', errorData.message);
      throw new Error(errorData.message || 'Failed to Sighout');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const updateMe = async (userData: Partial<EditProfileFormData>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData.message ', errorData.message);
      throw new Error(errorData.message || 'Failed to update user profile');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const sendVerificationEmail = async (email: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/send-verification-email`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData.message ', errorData.message);
      throw new Error(errorData.message || 'Failed to send verification email');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/send-forgotPasswordMail`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData.message ', errorData.message);
      throw new Error(
        errorData.message || 'Failed to send password reset email'
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Hotel API
 ********************************************************************** */
export const addMyHotel = async (hotelFormData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
      method: 'POST',
      credentials: 'include',
      body: hotelFormData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to add hotel';
      if (response.status === 413) {
        errorMessage = 'File size too large';
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchMyHotels = async (): Promise<HotelType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-hotels`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching hotels');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchMyHotelById = async (hotelId: string): Promise<HotelType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching hotel');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const updateMyHotelById = async (hotelFormData: FormData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-hotels/${hotelFormData.get('hotelId')}`,
      {
        method: 'PUT',
        body: hotelFormData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update hotel');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const deleteMyHotelById = async (hotelId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-hotels/${hotelId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error deleting hotel');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Room API
 ********************************************************************** */
export const addMyRoom = async (hotelId: string, roomFormData: FormData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-rooms/${hotelId}`, {
      method: 'POST',
      credentials: 'include',
      body: roomFormData,
    });

    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      const responseClone = response.clone();

      try {
        const errorData = await responseClone.json();
        if (response.status === 413) {
          errorMessage = 'File size too large';
        }
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchMyHotelRooms = async (hotelId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-rooms/hotel/${hotelId}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching hotel rooms');
    }

    return response.json() as Promise<RoomType[]>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchMyRoomById = async (roomId: string): Promise<RoomType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-rooms/${roomId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching room by id');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const updateMyRoomById = async (roomFormData: FormData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-rooms/${roomFormData.get('roomId')}`,
      {
        method: 'PUT',
        body: roomFormData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update room');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const deleteMyRoomById = async (roomId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-rooms/${roomId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error deleting room');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Room Number API
 ********************************************************************** */

export const fetchMyRoomNumberById = async (
  roomNumberId: string
): Promise<RoomNumberType> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-roomNumbers/${roomNumberId}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching room number');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const addMyRoomNumber = async (
  roomId: string,
  roomNumberData: { roomNumberName: string }
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-roomNumbers/${roomId}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomNumberData),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to add room number');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const updateMyRoomNumberById = async (
  roomNumberId: string,
  updatedRoomNumberData: RoomNumberType
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-roomNumbers/${roomNumberId}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRoomNumberData),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update room number');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const deleteMyRoomNumberById = async (
  roomId: string,
  roomNumberId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-roomNumbers/${roomId}/${roomNumberId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Error deleting room number');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchAvailableRooms = async (
  hotelId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<RoomType[]> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('checkInDate', checkInDate.toISOString());
    queryParams.append('checkOutDate', checkOutDate.toISOString());

    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${hotelId}/available-rooms/?${queryParams}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching available rooms');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const updateRoomNumberAvailability = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
): Promise<{ roomNumberName: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-rooms/${roomId}/update-availability`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkInDate, checkOutDate }),
      }
    );

    if (!response.ok) {
      throw new Error('Error updating room number availability');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const updateRoomNumberOutOfService = async (
  roomId: string,
  roomNumberId: string,
  isOutOfService: boolean
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-roomNumbers/${roomId}/${roomNumberId}/out-of-service`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOutOfService }),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update room number out of service status');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Payment API
 ********************************************************************** */
export const createPaymentIntent = async (
  hotelId: string,
  numberOfNights: string,
  roomType: string,
  checkInDate: string,
  checkOutDate: string
): Promise<PaymentIntentResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${hotelId}/bookings/payment-intent`,
      {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
          hotelId,
          numberOfNights,
          roomType,
          checkInDate,
          checkOutDate,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching payment intent');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Booking API
 ********************************************************************** */
export const createRoomBooking = async (formData: BookingFormData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${formData.hotelId}/bookings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      throw new Error('Error booking room');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchMyBookings = async (): Promise<BookingType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/my-bookings`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Unable to fetch bookings');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const cancelMyBookingById = async (bookingId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-bookings/${bookingId}/cancel`,
      {
        method: 'PUT',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchHotelBookings = async (hotelId: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/my-hotels/${hotelId}/bookings`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching hotel bookings');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchBookingById = async (
  bookingId: string
): Promise<BookingType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Unable to fetch booking details');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Review API
 ********************************************************************** */
export const createReview = async (hotelId: string, reviewData: FormData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${hotelId}/add-review`,
      {
        method: 'POST',
        credentials: 'include',
        body: reviewData,
      }
    );

    if (!response.ok) {
      throw new Error('Error creating review');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const deleteMyReviewById = async (reviewId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${reviewId}/delete`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Error deleting review');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const updateMyReviewById = async (
  reviewId: string,
  reviewData: FormData
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${reviewId}/update`,
      {
        method: 'PUT',
        body: reviewData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update review');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchHotelReviews = async (
  hotelId: string
): Promise<{
  reviews: ReviewType[];
  ratingCounts: { _id: number; count: number }[];
}> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hotels/${hotelId}/reviews`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Error fetching hotel reviews');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Search Hotel API
 ********************************************************************** */
export type SearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adultCount?: string;
  childCount?: string;
  page?: string;
  facilities?: string[];
  types?: string[];
  stars?: string[];
  startingPrice?: string;
  sortOption?: string;
};

export const searchHotels = async (
  searchParams: SearchParams
): Promise<HotelSearchResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('destination', searchParams.destination || '');
  queryParams.append('checkIn', searchParams.checkIn || '');
  queryParams.append('checkOut', searchParams.checkOut || '');
  queryParams.append('adultCount', searchParams.adultCount || '');
  queryParams.append('childCount', searchParams.childCount || '');
  queryParams.append('page', searchParams.page || '');

  queryParams.append('startingPrice', searchParams.startingPrice || '');
  queryParams.append('sortOption', searchParams.sortOption || '');

  searchParams.facilities?.forEach((facility) =>
    queryParams.append('allFacilities', facility)
  );

  searchParams.types?.forEach((type) => queryParams.append('types', type));
  searchParams.stars?.forEach((star) => queryParams.append('stars', star));

  const response = await fetch(
    `${API_BASE_URL}/api/hotels/search?${queryParams}`
  );

  if (!response.ok) {
    throw new Error('Error fetching hotels');
  }

  return response.json();
};

export const fetchHotels = async (): Promise<HotelType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching hotels');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export const fetchHotelById = async (hotelId: string): Promise<HotelType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching Hotels');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

/* **********************************************************************
 *                            Dashboard API
 ********************************************************************** */

export const fetchDashboardData = async (
  hotelId?: string | null
): Promise<DashboardDataType> => {
  try {
    const url = hotelId
      ? `${API_BASE_URL}/api/dashboard?hotelId=${hotelId}`
      : `${API_BASE_URL}/api/dashboard`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error fetching dashboard data');
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Something went wrong');
    }
  }
};
