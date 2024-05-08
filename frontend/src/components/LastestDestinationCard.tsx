import { Link } from 'react-router-dom';
import { HotelType } from '../../../backend/src/shared/types';
import { AiFillEnvironment } from 'react-icons/ai';

type Props = {
  hotel: HotelType;
};

const LatestDestinationCard = ({ hotel }: Props) => {
  return (
    <Link
      to={`/detail/${hotel._id}`}
      className="relative cursor-pointer overflow-hidden rounded-md"
    >
      <div className="h-[300px]">
        {hotel.imageUrls.map((imageUrl, index) => (
          <div key={index}>
            <img
              src={imageUrl}
              className="w-full h-full object-cover object-center bg-no-repeat"
              alt={hotel.name}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 p-3 bg-black bg-opacity-50 w-full rounded-b-md flex items-center">
        <span className="text-white font-bold tracking-tight text-2xl line-clamp-2">
          {hotel.name}
        </span>
        <span className="ml-4 text-white tracking-tight bg-red-500 p-1 rounded-md  whitespace-nowrap">
          <AiFillEnvironment className="inline fill-white text-xl mr-0.5" />
          {hotel.city}, {hotel.country}
        </span>
      </div>
    </Link>
  );
};

export default LatestDestinationCard;
