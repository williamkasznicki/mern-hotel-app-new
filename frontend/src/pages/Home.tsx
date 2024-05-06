import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import LatestDestinationCard from '../components/LastestDestinationCard';
import { Spinner } from 'flowbite-react';

const Home = () => {
  const {
    data: hotels,
    isLoading,
    isError,
  } = useQuery('fetchQuery', () => apiClient.fetchHotels());


  if (isError) {
    return <div className='italic text-xl font-bold'>Error fetching data.</div>;
  }

  const topRowHotels = hotels?.slice(0, 2) || [];
  const bottomRowHotels = hotels?.slice(2, 12) || [];

  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-bold">Latest Destinations</h2>
      <p>Most recent desinations added by our hosts</p>
      {isLoading ? (
        <Spinner
          color="purple"
          aria-label="Purple spinner"
          size={'xl'}
          className="mx-auto"
        />
      ) : (
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            {topRowHotels.map((hotel) => (
              <LatestDestinationCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {bottomRowHotels.map((hotel) => (
              <LatestDestinationCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
