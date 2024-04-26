import { useMutation, useQuery } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import * as apiClient from '../api-client';
import { useAppContext } from '../contexts/AppContext';
import { useState } from 'react';
import { RoomNumberType } from '../../../backend/src/shared/types';

const EditRoomNumber = () => {
  const { roomNumberId } = useParams<{ roomNumberId: string }>();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [roomNumberData, setRoomNumberData] = useState<RoomNumberType | null>(
    null
  );

  const { isLoading: isLoadingRoomNumber } = useQuery(
    ['fetchRoomNumberById', roomNumberId],
    () => apiClient.fetchMyRoomNumberById(roomNumberId || ''),
    {
      enabled: !!roomNumberId,
      onSuccess: (data) => {
        setRoomNumberData(data);
      },
    }
  );

  const { mutate: updateRoomNumber, isLoading: isUpdatingRoomNumber } =
    useMutation(
      (updatedRoomNumberData: RoomNumberType) =>
        apiClient.updateMyRoomNumberById(
          roomNumberId || '',
          updatedRoomNumberData
        ),
      {
        onSuccess: (data) => {
          showToast({ message: 'Room Number Updated!', type: 'SUCCESS' });
          navigate(`/edit-room/${data.roomId}`);
        },
        onError: () => {
          showToast({ message: 'Error Updating Room Number', type: 'ERROR' });
        },
      }
    );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoomNumberData((prevData) => ({
      ...prevData!,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!roomNumberData) return;

    updateRoomNumber(roomNumberData);
  };

  if (isLoadingRoomNumber) {
    return <div>Loading...</div>;
  }

  if (!roomNumberData) {
    return <div>Room Number not found.</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit Room Number</h1>
      <table className="w-full border-collapse rounded-lg dark:bg-slate-800">
        <tbody className="dark:text-white">
          <tr>
            <td className="border border-gray-400 px-4 py-2 font-medium">
              Room ID
            </td>
            <td className="border border-gray-400 px-4 py-2">
              {roomNumberData.roomId}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 px-4 py-2 font-medium">
              Room Number Name
            </td>
            <td className="border border-gray-400 px-4 py-2">
              <input
                type="text"
                id="roomNumberName"
                name="roomNumberName"
                value={roomNumberData.roomNumberName}
                onChange={handleInputChange}
                className="border rounded w-full py-2 px-3 font-normal dark:text-zinc-800"
              />
            </td>
          </tr>
          {/* <tr>
            <td className="border px-4 py-2 font-medium">Unavailable Dates</td>
            <td className="border px-4 py-2">
              <ul>
                {roomNumberData.unavailableDates.length ? (
                  roomNumberData.unavailableDates?.map((date, index) => (
                    <li key={index}>{new Date(date).toLocaleDateString()}</li>
                  ))
                ) : (
                  <div className="italic font-light">No dates data</div>
                )}
              </ul>
            </td>
          </tr> */}
          <tr>
            <td className="border border-gray-400 px-4 py-2 font-medium">
              Booking IDs
            </td>
            <td className="border border-gray-400 px-4 py-2">
              <ul>
                {roomNumberData.bookingId.length ? (
                  roomNumberData.bookingId?.map((bookingId, index) => (
                    <li key={index}>{bookingId}</li>
                  ))
                ) : (
                  <div className="italic font-light">No booking data</div>
                )}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={handleSave}
        disabled={isUpdatingRoomNumber}
        className="submit-btn mt-3 float-right"
      >
        {isUpdatingRoomNumber ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default EditRoomNumber;
