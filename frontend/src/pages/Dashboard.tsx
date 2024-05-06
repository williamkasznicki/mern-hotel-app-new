import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import { Pie, Bar } from 'react-chartjs-2';
import { Dropdown, Table } from 'flowbite-react';
import { HotelType } from '../../../backend/src/shared/types';
import { useThemeMode } from 'flowbite-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);


const Dashboard = () => {
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const { data: hotels } = useQuery('fetchMyHotels', apiClient.fetchMyHotels);
  const [timeRange, setTimeRange] = useState('All');
  const { mode } = useThemeMode();

  const { data: dashboardData, refetch } = useQuery(
    ['fetchDashboardData', selectedHotel],
    () => apiClient.fetchDashboardData(selectedHotel),
    {
      enabled: false,
    }
  );

  const pieChartRef = useRef<any>(null);
  const barChartRef = useRef<any>(null);

  useEffect(() => {
    refetch();
  }, [selectedHotel, refetch]);

  useEffect(() => {
    // Destroy the charts when the component unmounts
    return () => {
      if (pieChartRef.current) {
        pieChartRef.current.destroy();
      }
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
    };
  }, []);

  const handleHotelChange = (hotelId: string | null) => {
    setSelectedHotel(hotelId);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const filteredBookingStats = dashboardData
    ? dashboardData.bookingStats.filter((stat) => {
        if (timeRange === 'All') {
          return true;
        } else if (timeRange === 'Year') {
          const currentYear = new Date().getFullYear();
          return new Date(stat.month).getFullYear() === currentYear;
        } else if (timeRange === 'Month') {
          const currentMonth = new Date().getMonth();
          return new Date(stat.month).getMonth() === currentMonth;
        }
      })
    : [];

  if (!hotels || !dashboardData) {
    return <div>No hotels or dashboard data found..</div>
  }

  const hotelOptions = hotels.map((hotel: HotelType) => ({
    label: hotel.name,
    value: hotel._id,
  }));

  const pieChartData = dashboardData
    ? {
        labels: Object.keys(dashboardData.hotelTypes),
        datasets: [
          {
            data: Object.values(dashboardData.hotelTypes),
            backgroundColor:
              mode === 'dark'
                ? [
                    '#FF6384', // Red
                    '#2899f3', // Blue
                    '#FFCE56', // Yellow
                    '#8AC926', // Green
                    '#FF9F40', // Orange
                    '#FF6B6B', // Faded Red
                    '#4BC0C0', // Teal
                    '#9966FF', // Purple
                    '#FFD670', // Mustard
                    '#C9CBCF', // Gray
                    '#EE82EE', // Violet
                    '#FFA07A', // Light Salmon
                  ]
                : [
                    '#FF6384', // Red
                    '#36A2EB', // Blue
                    '#FFCE56', // Yellow
                    '#8AC926', // Green
                    '#FF9F40', // Orange
                    '#FF6B6B', // Faded Red
                    '#4BC0C0', // Teal
                    '#9966FF', // Purple
                    '#FFD670', // Mustard
                    '#C9CBCF', // Gray
                    '#EE82EE', // Violet
                    '#FFA07A', // Light Salmon
                  ],
            hoverBackgroundColor:
              mode === 'dark'
                ? [
                    '#DF5757', // Darker Red
                    '#2463e3', // Darker Blue
                    '#FFD180', // Darker Yellow
                    '#7CB342', // Darker Green
                    '#FF8C00', // Darker Orange
                    '#FF4D4D', // Darker Faded Red
                    '#36CDCD', // Darker Teal
                    '#8A2BE2', // Darker Purple
                    '#FFDB58', // Darker Mustard
                    '#A9A9A9', // Darker Gray
                    '#DA70D6', // Darker Violet
                    '#FF7F50', // Darker Light Salmon
                  ]
                : [
                    '#DF5757', // Darker Red
                    '#336EFF', // Darker Blue
                    '#FFD180', // Darker Yellow
                    '#7CB342', // Darker Green
                    '#FF8C00', // Darker Orange
                    '#FF4D4D', // Darker Faded Red
                    '#36CDCD', // Darker Teal
                    '#8A2BE2', // Darker Purple
                    '#FFDB58', // Darker Mustard
                    '#A9A9A9', // Darker Gray
                    '#DA70D6', // Darker Violet
                    '#FF7F50', // Darker Light Salmon
                  ],
          },
        ],
      }
    : { labels: [], datasets: [] };

  return (
    <>
      <div className="xs:px-2 md:px-0">
        <h1 className="text-3xl font-bold mb-6">Hotel Dashboard</h1>
        <Dropdown label="Select Hotel" onClick={() => handleHotelChange(null)}>
          {hotelOptions.map((option) => (
            <Dropdown.Item
              key={option.value}
              onClick={() => handleHotelChange(option.value)}
            >
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4 dark:text-white">
          <div className="bg-white dark:bg-[#060d1f] rounded-lg shadow p-4  border border-gray-2">
            <h2 className="text-xl font-bold mb-2">All Hotel Types</h2>
            <Pie ref={pieChartRef} data={pieChartData} />
          </div>

          <div className="bg-white dark:bg-[#060d1f] rounded-lg shadow p-4  border border-gray-2">
            <h2 className="text-xl font-bold mb-2">Booking Statistics</h2>
            <div className="space-x-2">
              <button
                onClick={() => handleTimeRangeChange('All')}
                className="bg-slate-800 text-white rounded-lg shadow p-2"
              >
                All
              </button>
              <button
                onClick={() => handleTimeRangeChange('Year')}
                className="bg-slate-800 text-white rounded-lg shadow p-2"
              >
                Year
              </button>
              <button
                onClick={() => handleTimeRangeChange('Month')}
                className="bg-slate-800 text-white rounded-lg shadow p-2"
              >
                Month
              </button>
            </div>
            <Bar
              ref={barChartRef}
              data={{
                labels: filteredBookingStats.map((stat) => stat.month),
                datasets: [
                  {
                    label: 'Successful Bookings',
                    data: filteredBookingStats.map(
                      (stat) => stat.successfulBookings
                    ),
                    backgroundColor: mode === 'dark' ? '#885cef' : '#2463e3',
                  },
                  {
                    label: 'Cancelled Bookings',
                    data: filteredBookingStats.map(
                      (stat) => stat.cancelledBookings
                    ),
                    backgroundColor: mode === 'dark' ? '#2463e3' : '#ffce56',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  x: {
                    ticks: {
                      stepSize: 1,
                    },
                  },
                  y: {
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="bg-white dark:bg-[#060d1f] rounded-lg shadow p-4  border border-gray-2">
            <h2 className="text-xl font-bold mb-2">
              Total Revenue (All Hotels)
            </h2>
            <p className="text-4xl">${dashboardData.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-[#060d1f] rounded-lg shadow p-4  border border-gray-2">
            <h2 className="text-xl font-bold mb-2">
              Hotel Revenue (Selected Hotel)
            </h2>
            <p className="text-4xl">${dashboardData.hotelRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-[#060d1f] rounded-lg shadow p-4  border border-gray-2">
            <h2 className="text-xl font-bold mb-2">Occupancy Rate</h2>
            <p className="text-4xl">
              {dashboardData.occupancyRate.toFixed(2)}%
            </p>
          </div>
          <div className="bg-white dark:bg-[#060d1f] rounded-lg shadow p-4 border border-gray-200">
            <h2 className="text-xl font-bold mb-2">Available Rooms</h2>
            <p className="text-4xl">
              {dashboardData.availableRooms} (
              {dashboardData.availableRoomPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Booking Details Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Booking Details</h2>
        <Table className="bg-white dark:bg-[#060d1f] dark:text-white overflow-x-auto">
          <Table.Head>
            <Table.HeadCell>Month</Table.HeadCell>
            <Table.HeadCell>Successful Bookings</Table.HeadCell>
            <Table.HeadCell>Cancelled Bookings</Table.HeadCell>

            <Table.HeadCell>Successful Rate</Table.HeadCell>
            <Table.HeadCell>Revenue</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {/* {dashboardData.bookingStats.map((stat) => ( */}
            {(filteredBookingStats || []).map((stat) => (
              <Table.Row key={stat.month}>
                <Table.Cell>{stat.month}</Table.Cell>
                <Table.Cell>{stat.successfulBookings}</Table.Cell>
                <Table.Cell>{stat.cancelledBookings}</Table.Cell>
                <Table.Cell>
                  {(
                    (stat.successfulBookings /
                      (stat.successfulBookings + stat.cancelledBookings)) *
                    100
                  ).toFixed(2)}
                  %
                </Table.Cell>
                <Table.Cell>
                  {stat.revenue ? `$${stat.revenue.toFixed(2)}` : '-'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  );
};

export default Dashboard;
