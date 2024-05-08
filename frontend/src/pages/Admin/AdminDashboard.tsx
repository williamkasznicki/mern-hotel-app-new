import { useState } from 'react';
import Sidebar from '../../components/Admin/SideBar';
import DashboardComponent from '../../components/Admin/Dashboard';
import UsersComponent from '../../components/Admin/Users';
import HotelsComponent from '../../components/Admin/Hotels';
import RoomsComponent from '../../components/Admin/Rooms';
import BookingsComponent from '../../components/Admin/Bookings';
import ReviewsComponent from '../../components/Admin/Reviews';
import FeedbackComponent from '../../components/Admin/Feedback';
import AnalyticsComponent from '../../components/Admin/Analytics';



const AdminDashboard = () => {
  const [activeButton, setActiveButton] = useState('dashboard');

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  return (
    <div className="flex overflow-auto">
      <Sidebar onButtonClick={handleButtonClick} />
      <div className="h-screen flex-1 p-7 overflow-auto">
        <h1 className="text-2xl font-semibold ">Admin Dashboard</h1>
        {/* Render content based on the active button */}
        {activeButton === 'dashboard' && <DashboardComponent onButtonClick={handleButtonClick} />}
        {activeButton === 'users' && <UsersComponent />}
        {activeButton === 'hotels' && <HotelsComponent />}
        {activeButton === 'rooms' && <RoomsComponent />}
        {activeButton === 'bookings' && <BookingsComponent />}
        {activeButton === 'reviews' && <ReviewsComponent />}
        {activeButton === 'feedback' && <FeedbackComponent />}
        {activeButton === 'analytics' && <AnalyticsComponent />}
      </div>
    </div>
  );
};

export default AdminDashboard;
