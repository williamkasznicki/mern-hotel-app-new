import { Link } from 'react-router-dom';
import { HotelType } from '../../../backend/src/shared/types';
import { AiFillStar } from 'react-icons/ai';
import { AiFillEnvironment } from 'react-icons/ai';
import { Carousel } from 'flowbite-react';
import type { CustomFlowbiteTheme } from 'flowbite-react';

type Props = {
  hotel: HotelType;
};

const customTheme: CustomFlowbiteTheme['carousel'] = {
  control: {
    base: 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 group-hover:bg-white/60 group-focus:outline-none group-focus:ring-4 group-focus:ring-white dark:bg-gray-800 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70 sm:h-10 sm:w-10',
    icon: 'h-5 w-5 text-red-500 dark:text-white sm:h-6 sm:w-6',
  },
};

const SearchResultsCard = ({ hotel }: Props) => {
  return (
    <div className="grid grid-cols-1 border border-slate-300 rounded-lg p-8 gap-8  dark:bg-slate-800 dark:text-white">
      <div className="w-full md:h-80 xl:h-96 xs:h-60 col-span-2">
        <Carousel theme={customTheme} color="primary">
          {hotel.imageUrls.map((imageUrl, index) => (
            <div key={index}>
              <Link to={`/detail/${hotel._id}`}>
                <img
                  src={imageUrl}
                  className="w-full h-full object-cover object-center rounded-sm"
                  alt={hotel.name}
                />
              </Link>
            </div>
          ))}
        </Carousel>
      </div>
      <div className="grid grid-rows-[1fr_1fr_1fr]">
        <div>
          <div className="flex items-center">
            <span className="flex">
              {Array.from({ length: hotel.starRating }).map((_, index) => (
                <AiFillStar key={index} className="fill-yellow-300" />
              ))}
            </span>
            <span className="ml-1 text-sm text-blue-400">{hotel.type}</span>
          </div>
          <Link
            to={`/detail/${hotel._id}`}
            className="text-2xl font-bold cursor-pointer line-clamp-2"
          >
            {hotel.name}
          </Link>
          <div className="flex items-center mt-2">
            <AiFillEnvironment className="fill-red-500 text-xl" />
            <span>
              {hotel.city}, {hotel.country}
            </span>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="line-clamp-3 mt-2 whitespace-normal">
            <div
              className="font-sans text-sm"
              dangerouslySetInnerHTML={{ __html: hotel.description }}
            ></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xs:grid-cols-1 place-content-center flex-end whitespace-nowrap">
          <div className="flex gap-1 items-center xs:mb-2 md:mb-0">
            {hotel.allFacilities.slice(0, 3).map((facility, index) => (
              <span
                key={index}
                className="bg-slate-300 p-2 rounded-lg font-bold xs:text-xs whitespace-nowrap md:text-sm"
              >
                {facility}
              </span>
            ))}
            <span className="text-sm">
              {hotel.allFacilities.length > 3 &&
                `+${hotel.allFacilities.length - 3} more`}
            </span>
          </div>

          <div className="flex flex-col md:items-end gap-1">
            <span className="font-bold">฿{hotel.startingPrice} per night</span>
            <Link
              to={`/detail/${hotel._id}`}
              // w-2/4 bg-indigo-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50
              className=" bg-indigo-500 text-white h-full p-2 font-bold text-xl max-w-fit active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50"
            >
              View More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsCard;
