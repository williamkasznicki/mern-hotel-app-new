import { FormEvent, useState } from 'react';
import { useSearchContext } from '../contexts/SearchContext';
import { MdTravelExplore } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

const SearchBar = () => {
  const navigate = useNavigate();
  const search = useSearchContext();

  const [destination, setDestination] = useState<string>(search.destination);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(true);

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  const handleClear = () => {
    setDestination('');
    setCheckIn(new Date());
    setCheckOut(new Date());
    setAdultCount(1);
    setChildCount(0);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    search.saveSearchValues(
      destination,
      checkIn,
      checkOut,
      adultCount,
      childCount
    );
    navigate('/search');
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1);
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  return (
    <div className="relative mb-2">
      <button
        onClick={toggleSearchBar}
        className="absolute top-2 right-2 bg-neutral-800 text-white p-2 rounded-full"
      >
        {showSearchBar ? <FaChevronDown /> : <FaChevronDown className="rotate-180" />}
      </button>
      {showSearchBar && (
        <form
          onSubmit={handleSubmit}
          className="-mt-8 p-3 bg-white rounded-lg shadow-md items-center gap-4 grid grid-cols-2 md:grid-cols-2"
        >
          <div className="flex flex-row items-center flex-1 bg-white p-2 border border-slate-600 rounded-lg">
            <MdTravelExplore size={25} className="mr-2" />
            <input
              placeholder="Where are you going?"
              className="text-md w-full focus:outline-none"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>

          <div className="flex bg-white px-2 py-1 gap-2 border-b border-slate-300 hover:border-slate-700 focus:border-slate-700 transition ease-in-out duration-300">
            <label className="items-center flex border-e border-slate-400">
              Adults:
              <input
                className="w-full p-1 border-none focus:outline-none font-bold focus:border-slate-700"
                type="number"
                min={1}
                max={20}
                value={adultCount}
                onChange={(event) =>
                  setAdultCount(parseInt(event.target.value))
                }
              />
            </label>
            <label className="items-center flex">
              Children:
              <input
                className="w-full p-1 border-none focus:outline-none font-bold focus:border-slate-700"
                type="number"
                min={0}
                max={20}
                value={childCount}
                onChange={(event) =>
                  setChildCount(parseInt(event.target.value))
                }
              />
            </label>
          </div>
          <div>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-in Date"
              className="min-w-full bg-white p-2 border-x-white border-t-white  border-b-slate-300 focus:outline-none hover:border-b-slate-700 focus:border-slate-700 transition ease-in-out duration-300"
              wrapperClassName="min-w-full"
            />
          </div>
          <div>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-out Date"
              className="min-w-full bg-white p-2 border-x-white border-t-white  border-b-slate-300 focus:outline-none hover:border-b-slate-700 focus:border-slate-700 transition ease-in-out duration-300"
              wrapperClassName="min-w-full"
            />
          </div>
          <div className="flex gap-1">
            <button className="w-2/4 bg-indigo-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50 ">
              Search
            </button>
            <button
              onClick={handleClear}
              className="md:w-1/4 bg-rose-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
            >
              Clear
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SearchBar;
