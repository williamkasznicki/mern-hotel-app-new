export type UserType = {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  deleted_at?: Date | null;
};

export type HotelType = {
  _id: string;
  userId: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  address: string;
  landmarks: { name: string; distance: string }[];
  coordinate: string[];
  starRating: number;
  allFacilities: string[];
  startingPrice: number;
  imageUrls: string[];
  deleted_at?: Date | null;
  room: string[];
  review: string[];
  bookings: string[];
};

export type ReviewType = {
  _id: string;
  userId: string;
  userName: string;
  hotelId: string;
  starRating: number;
  comment: string;
  createdAt: Date;
  deleted_at?: Date | null;
};

export type BookingType = {
  _id: string;
  hotelId: string;
  userId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  roomNumberId: string;
  check_in: Date;
  check_out: Date;
  status: string;
  cancelledBy?: string;
  citizen_id: string;
  totalCost: number;
  paymentIntentId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RoomType = {
  _id: string;
  hotelId: string;
  roomType: string;
  description: string;
  pricePerNight: number;
  roomFacilities: string[];
  maxAdult: number;
  maxChild: number;
  imageUrls: string[];
  deleted_at?: Date | null;
  roomNumbers: RoomNumberType[];
};

export type RoomNumberType = {
  _id: string;
  roomNumberName: string;
  roomId: string;
  isOutOfService: boolean;
  unavailableDates: Date[];
  bookingId: string[];
  deleted_at?: Date | null;
};

export type HotelSearchResponse = {
  data: HotelType[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};

export type PaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  totalCost: number;
};

export type DashboardDataType = {
  hotelTypes: { [key: string]: number };
  totalRevenue: number;
  hotelRevenue: number;
  bookingStats: {
    month: string;
    successfulBookings: number;
    cancelledBookings: number;
    revenue: number;
  }[];
  occupancyRate: number;
  availableRooms: number;
  availableRoomPercentage: number;
};
