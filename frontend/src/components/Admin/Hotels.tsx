// Hotels.tsx
import React, { useEffect, useState } from 'react';
import * as apiClient from '../../api-client';
import { HotelType } from '../../../../backend/src/shared/types';
import PrintTableButton from '../../components/Admin/PrintTableButton';

const Hotels = () => {
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchHotels();
  }, [currentPage, searchTerm, sortOption, sortOrder]);

  const fetchHotels = async () => {
    try {
      const response = await apiClient.getAllHotels(
        currentPage,
        20,
        sortOption,
        sortOrder,
        searchTerm
      );
      setHotels(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.log('Error fetching hotels:', error);
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
        data={hotels}
        headers={[
          { key: '_id', label: 'ID' },
          { key: 'userId', label: 'User ID' },
          { key: 'name', label: 'Name' },
          { key: 'city', label: 'City' },
          { key: 'country', label: 'Country' },
          { key: 'type', label: 'Type' },
          { key: 'starRating', label: 'Star Rating' },
          { key: 'startingPrice', label: 'Starting Price' },
          { key: 'deleted_at', label: 'Status' },
        ]}
        renderRow={(hotel: HotelType): string => `
    <td>${hotel._id}</td>
    <td>${hotel.userId}</td>
    <td>${hotel.name}</td>
    <td>${hotel.city}</td>
    <td>${hotel.country}</td>
    <td>${hotel.type}</td>
    <td>${hotel.starRating}</td>
    <td>${hotel.startingPrice}</td>
    <td>${hotel.deleted_at ? 'Deleted' : 'Active'}</td>
  `}
        title="Hotel Data"
      />

      {/* Hotel Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-md">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('userId')}
              >
                User ID
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 inline ml-1 cursor-pointer"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                </svg>
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('name')}
              >
                Name
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 inline ml-1 cursor-pointer"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                </svg>
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('city')}
              >
                City
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 inline ml-1 cursor-pointer"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                </svg>
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('country')}
              >
                Country
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 inline ml-1 cursor-pointer"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                </svg>
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('type')}
              >
                Type
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 inline ml-1 cursor-pointer"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                </svg>
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('starRating')}
              >
                Star Rating
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 inline ml-1 cursor-pointer"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                </svg>
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                onClick={() => handleSort('startingPrice')}
              >
                Starting Price
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 inline ml-1 cursor-pointer"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                </svg>
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
            {hotels.map((hotel) => (
              <tr
                key={hotel._id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="px-6 py-4">{hotel.userId}</td>
                <td className="px-6 py-4">{hotel.name}</td>
                <td className="px-6 py-4">{hotel.city}</td>
                <td className="px-6 py-4">{hotel.country}</td>
                <td className="px-6 py-4">{hotel.type}</td>
                <td className="px-6 py-4">{hotel.starRating ?? 'Null'}</td>
                <td className="px-6 py-4">
                ฿ {(hotel.startingPrice as any)?.$numberDecimal ?? 'Null'}
                </td>
                <td className="px-6 py-4">
                  {hotel.deleted_at ? (
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
            {hotels.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-900">
            {totalPages * 20}
          </span>
        </span>
        <span className="font-semibold text-gray-900 dark:text-gray-900">
          {' '}
          (Total of {totalPages} pages and {hotels.length} records)
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

export default Hotels;
