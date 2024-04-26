import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import Layout from './layouts/Layout';
import Register from './pages/Register';
import SignIn from './pages/SignIn';
import AddHotel from './pages/AddHotel';
import { useAppContext } from './contexts/AppContext';
import MyHotels from './pages/MyHotels';
import EditHotel from './pages/EditHotel';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Home from './pages/Home';
import EditRoom from './pages/EditRoom';
import AddRoom from './pages/AddRoom';
import EditRoomNumber from './pages/EditRoomNumber';
import HotelBookings from './pages/HotelBookings';
import BookingDetails from './components/BookingDetails';
import ViewProfile from './pages/ViewProfile';
import Dashboard from './pages/Dashboard';

const App = () => {
  const { isLoggedIn } = useAppContext();
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <Search />
            </Layout>
          }
        />
        <Route
          path="/detail/:hotelId"
          element={
            <Layout>
              <Detail />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout>
              <Register />
            </Layout>
          }
        />
        <Route
          path="/sign-in"
          element={
            <Layout>
              <SignIn />
            </Layout>
          }
        />

        {isLoggedIn && (
          <>
            <Route
              path="/view-profile"
              element={
                <Layout>
                  <ViewProfile />
                </Layout>
              }
            />

            <Route
              path="/hotel/:hotelId/booking/:roomId"
              element={
                <Layout>
                  <Booking />
                </Layout>
              }
            />

            <Route
              path="/add-hotel"
              element={
                <Layout>
                  <AddHotel />
                </Layout>
              }
            />
            <Route
              path="/edit-hotel/:hotelId"
              element={
                <Layout>
                  <EditHotel />
                </Layout>
              }
            />
            <Route
              path="/my-hotels"
              element={
                <Layout>
                  <MyHotels />
                </Layout>
              }
            />
            <Route
              path="/edit-room/:roomId"
              element={
                <Layout>
                  <EditRoom />
                </Layout>
              }
            />
            <Route
              path="/add-room/:hotelId"
              element={
                <Layout>
                  <AddRoom />
                </Layout>
              }
            />
            <Route
              path="/edit-room-number/:roomNumberId"
              element={
                <Layout>
                  <EditRoomNumber />
                </Layout>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <Layout>
                  <MyBookings />
                </Layout>
              }
            />
            <Route
              path="/hotel-bookings/:hotelId"
              element={
                <Layout>
                  <HotelBookings />
                </Layout>
              }
            />
            <Route
              path="/booking-details/:bookingId"
              element={
                <Layout>
                  <BookingDetails />
                </Layout>
              }
            />
            <Route
              path="/hotel-dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
