import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import SignOutButton from './SignOutButton';
import Typed from 'typed.js';
import { RiAccountCircleFill, RiDashboardLine } from 'react-icons/ri';
import { LuHotel, LuConciergeBell } from 'react-icons/lu';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useThemeMode } from 'flowbite-react';
import * as apiClient from '../api-client';

const Header = () => {
  const { isLoggedIn, isSuperAdmin } = useAppContext();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const { mode, toggleMode } = useThemeMode();
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const { data: user } = useQuery('currentUser', apiClient.fetchCurrentUser);

  useEffect(() => {
    const targetElement = document.getElementById('auto-type');

    const options = {
      strings: ['BookEzy.com'],
      typeSpeed: 70,
      showCursor: false,
    };

    const typed = new Typed(targetElement, options);

    // Clean up function to destroy Typed instance when component unmounts
    return () => {
      typed.destroy();
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }

      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-slate-900 py-5 xs:px-2">
      <div className="container mx-auto flex justify-between">
        <span className="xs:text-3xl lg:text-4xl text-white font-bold tracking-tight">
          <Link to="/" id="auto-type">
          BookEzy.com
          </Link>
        </span>
        {/* responsive menu start */}
        <span className="flex items-center space-x-2 md:hidden z-20">
          <button
            type="button"
            className="flex items-center text-lg text-slate-800 px-3 py-1.5 font-bold rounded transition ease-in-out hover:duration-400 outline-none"
            onClick={toggleMode}
          >
            {mode === 'dark' ? (
              <FaSun className="text-yellow-300 mr-2" size={18} />
            ) : (
              <FaMoon className="text-gray-600 mr-2" size={18} />
            )}{' '}
          </button>
          <button
            className="text-white"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={showMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              />
            </svg>
          </button>
        </span>

        {showMenu && (
          <div
            className="container md:hidden absolute top-16 text-black w-full h-auto z-10"
            ref={menuRef}
          >
            <div className="flex flex-col bg-white p-2 rounded-md shadow-md">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/my-bookings"
                    className="hover:bg-slate-800 hover:text-white p-2"
                  >
                    <LuConciergeBell className="inline mr-2" size={18} />
                    My Bookings
                  </Link>
                  <Link
                    to="/my-hotels"
                    className="hover:bg-slate-800 hover:text-white p-2"
                  >
                    <LuHotel className="inline mr-2" size={18} />
                    My Hotels
                  </Link>
                  <hr className="border-t border-gray-300 my-1" />
                  <Link
                    to="/view-profile"
                    className="hover:bg-slate-800 hover:text-white p-2"
                  >
                    <RiAccountCircleFill className="inline mr-2" size={18} />
                    Profile
                  </Link>
                  {isSuperAdmin && (
                    <>
                      <Link
                        to="/admin-dashboard"
                        className="hover:bg-slate-800 hover:text-white p-2"
                      >
                        <RiDashboardLine className="inline mr-2" size={18} />
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  <hr className="my-2 border-t border-gray-700" />

                  <SignOutButton />
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="hover:bg-slate-800 hover:text-white p-2"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
        {/* responsive menu end */}

        <span className="hidden md:flex space-x-2 items-center">
          {isLoggedIn ? (
            <>
              <Link
                className="flex items-center xs:text-sm lg:text-lg text-white px-3 py-2 font-bold hover:bg-slate-700 rounded transition ease-in-out hover:duration-300"
                to="/my-bookings"
              >
                <LuConciergeBell className="mr-2 text-2xl" />
                My Bookings
              </Link>
              <Link
                className="flex items-center xs:text-sm lg:text-lg text-white px-3 py-2 font-bold hover:bg-slate-700 rounded transition ease-in-out hover:duration-300 relative"
                to="/my-hotels"
              >
                <LuHotel className="mr-2 text-2xl" />
                My Hotels
              </Link>
              <div className="relative" ref={settingsMenuRef}>
                <button
                  className="flex items-center align-center text-lg text-slate-700 px-[0.4rem] py-[0.4rem] bg-white hover:bg-slate-700 hover:text-white rounded-full transition ease-out hover:duration-300"
                  onClick={toggleSettingsMenu}
                >
                  <RiAccountCircleFill size={24} />
                  Hello, {user?.firstName}
                </button>
                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20 transition ease-in-out hover:duration-300">
                    <div className="grid grid-pcols-1 gap-2 p-2 rounded-sm">
                      <Link
                        to="/view-profile"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition ease-in-out hover:duration-300"
                      >
                        Profile
                      </Link>
                      <hr className="border-b border-gray-300" />
                      {isSuperAdmin && (
                        <>
                          <Link
                            to="/admin-dashboard"
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition ease-in-out hover:duration-300"
                          >
                            Admin Dashboard
                          </Link>
                          <hr className="my-2 border-t border-gray-700" />
                        </>
                      )}
                      <SignOutButton />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/sign-in"
              className="flex bg-white items-center text-lg text-slate-800 px-3 py-1.5 font-bold rounded transition ease-in-out hover:duration-400 hover:scale-105"
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            className="flex items-center text-lg text-slate-800 px-3 py-1.5 font-bold rounded transition ease-in-out hover:duration-400 hover:scale-105"
            onClick={toggleMode}
          >
            {mode === 'dark' ? (
              <FaSun className="text-yellow-300 mr-2" size={18} />
            ) : (
              <FaMoon className="text-gray-600 mr-2" size={18} />
            )}
          </button>
        </span>
      </div>
    </div>
  );
};

export default Header;
