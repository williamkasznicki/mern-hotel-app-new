import React, { useEffect, useState } from 'react';
import * as apiClient from '../../api-client';
import { RoomType } from '../../../../backend/src/shared/types';
import PrintTableButton from './PrintTableButton';

const Rooms = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchRooms();
  }, [currentPage, searchTerm, sortOption, sortOrder]);

  const fetchRooms = async () => {
    try {
      const response = await apiClient.getAllRooms(
        currentPage,
        20,
        sortOption,
        sortOrder,
        searchTerm
      );
      setRooms(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.log('Error fetching rooms:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (column === sortOption) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mt-2 relative overflow-x-auto shadow-md sm:rounded-lg rounded-md dark:bg-gray-200">
      {/* Search Input */}
      <div className="p-4">
        <label htmlFor="table-search" className="sr-only">
          Search
        </label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            id="table-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-80 pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search for users"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <PrintTableButton
        data={rooms}
        headers={[
          { key: 'hotelId', label: 'Hotel ID' },
          { key: 'roomType', label: 'Room Type' },
          { key: 'pricePerNight', label: 'Price per Night' },
          { key: 'maxAdult', label: 'Max Adults' },
          { key: 'maxChild', label: 'Max Children' },
          { key: 'roomNumbers', label: 'Room Count' },
          { key: 'deleted_at', label: 'Status' },
        ]}
        renderRow={(room: RoomType) => `
          <td>${room.hotelId}</td>
          <td>${room.roomType}</td>
          <td>${room.pricePerNight}</td>
          <td>${room.maxAdult}</td>
          <td>${room.maxChild}</td>
          <td>${room.roomNumbers.length}</td>
          <td>${room.deleted_at ? 'Deleted' : 'Active'}</td>
        `}
        title="Room Data"
      />

      {/* Room Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-md">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('hotelId')}
              >
                Hotel ID
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('roomType')}
              >
                Room Type
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('pricePerNight')}
              >
                Price per Night
              </th>
              <th scope="col" className="px-6 py-3">
                Max Adults
              </th>
              <th scope="col" className="px-6 py-3">
                Max Children
              </th>
              <th scope="col" className="px-6 py-3">
                Room Count
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4">{room.hotelId}</td>
                <td className="px-6 py-4">{room.roomType}</td>
                <td className="px-6 py-4">
                ฿ {(room.pricePerNight as any).$numberDecimal || '0'}
                </td>
                <td className="px-6 py-4">{room.maxAdult}</td>
                <td className="px-6 py-4">{room.maxChild}</td>
                <td className="px-6 py-4">{room.roomNumbers.length}</td>
                <td className="px-6 py-4">
                  {room.deleted_at ? (
                    <span className="text-red-500">Deleted</span>
                  ) : (
                    <span className="text-green-500">Active</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <a
                    href="#"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    Edit
                  </a>
                  <a
                    href="#"
                    className="font-medium text-red-600 dark:text-red-500 hover:underline ml-4"
                  >
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4">
        <span className="text-sm font-normal text-gray-800 dark:text-gray-900">
          Showing{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-900">
            {rooms.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-900">
            {totalPages * 20}
          </span>
        </span>
        <span className="font-semibold text-gray-900 dark:text-gray-900">
          {' '}
          (Total of {totalPages} pages and {rooms.length} records)
        </span>
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <li key={page}>
              <button
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 leading-tight ${
                  currentPage === page
                    ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                {page}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Rooms;
