import React, { useContext, useState } from 'react';

type SearchContext = {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  hotelId: string;
  roomId: string;
  roomNumberName: string;
  saveSearchValues: (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number,
    roomId?: string,
    roomNumberName?: string
  ) => void;
};

const SearchContext = React.createContext<SearchContext | undefined>(undefined);

type SearchContextProviderProps = {
  children: React.ReactNode;
};

/* **********************************************************************
 *                            SearchContext
 ********************************************************************** */
export const SearchContextProvider = ({
  children,
}: SearchContextProviderProps) => {
  // automatically check the session storage, if exists it's going to populate the state for us
  const [destination, setDestination] = useState<string>(
    () => sessionStorage.getItem('destination') || ''
  );
  const [checkIn, setCheckIn] = useState<Date>(
    () =>
      new Date(sessionStorage.getItem('checkIn') || new Date().toISOString())
  );
  const [checkOut, setCheckOut] = useState<Date>(
    () =>
      new Date(sessionStorage.getItem('checkOut') || new Date().toISOString())
  );
  const [adultCount, setAdultCount] = useState<number>(() =>
    parseInt(sessionStorage.getItem('adultCount') || '1')
  );
  const [childCount, setChildCount] = useState<number>(() =>
    parseInt(sessionStorage.getItem('childCount') || '0')
  );
  const [hotelId, setHotelId] = useState<string>(
    () => sessionStorage.getItem('hotelID') || ''
  );

  const [roomId, setRoomId] = useState<string>(
    () => sessionStorage.getItem('roomId') || ''
  );

  const [roomNumberName, setRoomNumberName] = useState<string>('');

  const saveSearchValues = (
    destination: string,
    checkIn: Date,
    checkOut: Date,
    adultCount: number,
    childCount: number,
    hotelId?: string,
    roomId?: string,
    roomNumberName?: string,
  ) => {
    setDestination(destination);
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setAdultCount(adultCount);
    setChildCount(childCount);
    

    if (roomId) {
      setRoomId(roomId);
    }
    if (hotelId) {
      setHotelId(hotelId);
    }

    if (roomNumberName) {
      setRoomNumberName(roomNumberName);
    }

    sessionStorage.setItem('destination', destination);
    sessionStorage.setItem('checkIn', checkIn.toISOString());
    sessionStorage.setItem('checkOut', checkOut.toISOString());
    sessionStorage.setItem('adultCount', adultCount.toString());
    sessionStorage.setItem('childCount', childCount.toString());

    if (roomId) {
      sessionStorage.setItem('roomId', roomId);
    }

    if (roomNumberName) {
      sessionStorage.setItem('roomNumberName', roomNumberName);
    }

    if (hotelId) {
      sessionStorage.setItem('hotelId', hotelId);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        destination,
        checkIn,
        checkOut,
        adultCount,
        childCount,
        hotelId,
        roomId,
        roomNumberName,
        saveSearchValues,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  return context as SearchContext;
};
