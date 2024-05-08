import { useState } from 'react';
import {
  MdDashboardCustomize,
  MdOutlineMessage,
  MdOutlineAnalytics,
  MdOutlineSupervisorAccount,
  MdOutlineHotel,
} from 'react-icons/md';
import { FaChevronCircleLeft, FaSearch } from 'react-icons/fa';
import { GoCodeReview } from 'react-icons/go';
import { LuConciergeBell, LuHotel, LuLogOut } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { useThemeMode } from 'flowbite-react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../../api-client';
import { useAppContext } from '../../contexts/AppContext';

type SidebarProps = {
  onButtonClick: (buttonName: string) => void;
};

const Sidebar = ({ onButtonClick }: SidebarProps) => {
  const [open, setOpen] = useState(true);
  const { mode, toggleMode } = useThemeMode();

  const queryClient = useQueryClient();
  const { showToast } = useAppContext();

  const mutation = useMutation(apiClient.signOut, {
    onSuccess: async () => {
      await queryClient.invalidateQueries('validateToken');
      showToast({ message: 'Signed Out!', type: 'SUCCESS' });
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: 'ERROR' });
    },
  });

  const handleClick = () => {
    mutation.mutate();
  };

  return (
    <div className="sticky left-0 z-10">
      <div
        className={` ${
          open ? 'w-70' : 'w-20 '
        }  bg-gradient-to-b from-indigo-900 from-10% via-sky-900 via-100% h-screen p-5  pt-8 relative duration-300`}
      >
        <FaChevronCircleLeft
          className={`text-white absolute cursor-pointer -right-3 top-9 border-2 border-indigo-800 bg-indigo-800 rounded-full 
            ${!open && 'rotate-180'}`}
          size={26}
          onClick={() => setOpen(!open)}
        />

        <div className="flex gap-x-4 items-center">
          <Link
            to="/admin-dashboard"
            className="whitespace-nowrap"
            onClick={() => onButtonClick('dashboard')}
          >
            <MdDashboardCustomize
              className={`inline duration-500 mr-2 text-white ${
                open && 'rotate-[360deg]'
              }`}
              size={30}
            />
            <h1
              className={`text-white inline origin-left font-medium text-xl duration-200  ${
                !open && 'hidden'
              }`}
            >
              Admin Dashboard
            </h1>
          </Link>
        </div>

        <ul className="pt-6">
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mb-6
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
          >
            <FaSearch size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Search
            </span>
          </li>

          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={() => onButtonClick('users')}
          >
            <MdOutlineSupervisorAccount size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Users
            </span>
          </li>
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={() => onButtonClick('hotels')}
          >
            <LuHotel size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Hotels
            </span>
          </li>
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={() => onButtonClick('rooms')}
          >
            <MdOutlineHotel size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Rooms
            </span>
          </li>
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={() => onButtonClick('bookings')}
          >
            <LuConciergeBell size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Bookings
            </span>
          </li>
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mb-6
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={() => onButtonClick('reviews')}
          >
            <GoCodeReview size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Reviews
            </span>
          </li>
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={() => onButtonClick('feedback')}
          >
            <MdOutlineMessage size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Feedback
            </span>
          </li>
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={() => onButtonClick('analytics')}
          >
            <MdOutlineAnalytics size={20} className="inline" />
            <span
              className={`${
                !open && 'hidden'
              } origin-left duration-200 text-lg`}
            >
              Analytics
            </span>
          </li>

          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 mb-6
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500`}
            onClick={toggleMode}
          >
            {mode === 'dark' ? (
              <FaMoon className="text-purple-600" size={18} />
            ) : (
              <FaSun className="text-yellow-300" size={18} />
            )}
            <span className={`${!open && 'hidden'} text-lg capitalize`}>
              {mode}
            </span>
          </li>
          <hr className="my-3 border-white/40" />
          <li
            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
            bg-gradient-to-r from-transparent hover:from-pink-500 hover:to-yellow-500 duration-300 border`}
            onClick={() => onButtonClick('analytics')}
          >
            <button
              onClick={handleClick}
              className="w-full text-white rounded-sm "
            >
              <LuLogOut className="inline" /> Sign Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
