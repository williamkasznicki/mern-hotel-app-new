import React from 'react';
import { BookingType } from '../../../backend/src/shared/types';

interface PrintTableButtonProps {
  currentBookings: BookingType[];
  roomNumbersMap?: { [key: string]: string };
  hotelName: string;
  dateRange: string;
}

const PrintTableButton: React.FC<PrintTableButtonProps> = ({
  currentBookings,
  roomNumbersMap,
  hotelName,
  dateRange,
}) => {
  const printTableData = () => {
    const tableData = currentBookings.map((booking: BookingType) => [
      booking._id,
      `${booking.firstName} ${booking.lastName}`,
      roomNumbersMap && roomNumbersMap[booking.roomNumberId]
        ? roomNumbersMap[booking.roomNumberId]
        : 'ERROR!',
      new Date(booking.check_in).toLocaleDateString(),
      new Date(booking.check_out).toLocaleDateString(),
      booking.citizen_id,
      `฿${booking.totalCost}`,
      booking.status,
    ]);

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Booking Data</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
            }
          </style>
        </head>
        <body>
          <h1>${hotelName}</h1>
          <p>Date Range: ${dateRange}</p>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Name</th>
                <th>Room Name</th>
                <th>Check-In Date</th>
                <th>Check-Out Date</th>
                <th>Citizen ID</th>
                <th>Total Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableData
                .map(
                  (row: (string | number)[]) => `
                <tr>
                  ${row
                    .map((cell: string | number) => `<td>${cell}</td>`)
                    .join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <button
      onClick={printTableData}
      className="bg-emerald-500 text-white px-4 py-2 rounded"
    >
      Print Table
    </button>
  );
};

export default PrintTableButton;
