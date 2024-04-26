import { useQuery } from 'react-query';
import { useSearchContext } from '../contexts/SearchContext';
import * as apiClient from '../api-client';
import { useState } from 'react';
import SearchResultsCard from '../components/SearchResultsCard';
import Pagination from '../components/Pagination';
import StarRatingFilter from '../components/StarRatingFilter';
import HotelTypesFilter from '../components/HotelTypesFilter';
import FacilitiesFilter from '../components/FacilitiesFilter';
import PriceFilter from '../components/PriceFilter';

const Search = () => {
  const search = useSearchContext();
  const [page, setPage] = useState<number>(1);
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);

  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    allFacilities: selectedFacilities,
    startingPrice: selectedPrice?.toString(),
    sortOption,
  };

  const { data: hotelData } = useQuery(['searchHotels', searchParams], () =>
    apiClient.searchHotels(searchParams)
  );

  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const starRating = event.target.value;

    setSelectedStars((prevStars) =>
      event.target.checked
        ? [...prevStars, starRating]
        : prevStars.filter((star) => star !== starRating)
    );
  };

  const handleHotelTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hotelType = event.target.value;

    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((hotel) => hotel !== hotelType)
    );
  };

  const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const facility = event.target.value;

    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, facility]
        : prevFacilities.filter((prevFacility) => prevFacility !== facility)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      <div className="p-2 md:p-0">
        <button
          className="flex items-center justify-center gap-2 mb-4 lg:hidden bg-yellow-300 p-2 rounded-md font-bold hover:bg-yellow-400 active:scale-95 text-white"
          onClick={() => setShowFilter(!showFilter)}
        >
          <span>{showFilter ? 'Hide' : 'Show'} Filters</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform ${
              showFilter ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          className={`rounded-lg border border-slate-300 dark:bg-slate-800 dark:text-white p-5 h-fit ${
            showFilter ? '' : 'hidden lg:block'
          }`}
        >
          <div className="space-y-5 rounded-lg">
            <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
              Filter by:
            </h3>
            <StarRatingFilter
              selectedStars={selectedStars}
              onChange={handleStarsChange}
              className="lg:block"
            />
            <HotelTypesFilter
              selectedHotelTypes={selectedHotelTypes}
              onChange={handleHotelTypeChange}
              className="lg:block"
            />
            <FacilitiesFilter
              selectedFacilities={selectedFacilities}
              onChange={handleFacilityChange}
              className="lg:block"
            />
            <PriceFilter
              selectedPrice={selectedPrice}
              onChange={(value?: number) => setSelectedPrice(value)}
              className="lg:block"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 p-2 md:p-0">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {hotelData?.pagination.total} Hotels found
            {search.destination ? ` in ${search.destination}` : ''}
          </span>
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">Sort By</option>
            <option value="starRating">Star Rating</option>
            <option value="startingPriceAsc">
              Price Per Night (low to high)
            </option>
            <option value="startingPriceDesc">
              Price Per Night (high to low)
            </option>
          </select>
        </div>
        {hotelData?.data.map((hotel) => (
          <SearchResultsCard key={hotel._id} hotel={hotel} />
        ))}
        <div>
          <Pagination
            page={hotelData?.pagination.page || 1}
            pages={hotelData?.pagination.pages || 1}
            onPageChange={(page) => setPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
