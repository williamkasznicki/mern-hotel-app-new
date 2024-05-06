import { useMutation, useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import * as apiClient from '../api-client';
import ManageRoomForm from '../forms/ManageRoomForm/ManageRoomForm';
import { useAppContext } from '../contexts/AppContext';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiEditAlt, BiTrashAlt } from 'react-icons/bi';

const EditRoom = () => {
  const { roomId } = useParams();
  const { showToast } = useAppContext();
  const [roomNumberName, setRoomNumberName] = useState('');
  const [expandedSection, setExpandedSection] = useState<string>('room');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const toggleDeleteConfirmation = () => {
    setShowDeleteConfirmation(!showDeleteConfirmation);
  };

  const { data: room, refetch: refetchRoom } = useQuery(
    'fetchMyRoomById',
    () => apiClient.fetchMyRoomById(roomId || ''),
    {
      enabled: !!roomId,
    }
  );

  const deleteRoomNumber = async (roomNumberId: string) => {
    try {
      await apiClient.deleteMyRoomNumberById(roomId!, roomNumberId);
      showToast({
        message: 'Room number deleted successfully',
        type: 'SUCCESS',
      });
      window.location.reload();
    } catch (error) {
      showToast({ message: 'Error deleting Room number', type: 'ERROR' });
    }
  };

  const { mutate, isLoading } = useMutation(apiClient.updateMyRoomById, {
    onSuccess: () => {
      showToast({ message: 'Room Saved!', type: 'SUCCESS' });
    },
    onError: () => {
      showToast({ message: 'Error Saving Room', type: 'ERROR' });
    },
  });

  const { mutate: addRoomNumber, isLoading: isAddingRoomNumber } = useMutation(
    (roomNumberName: string) =>
      apiClient.addMyRoomNumber(roomId || '', { roomNumberName }),
    {
      onSuccess: () => {
        showToast({ message: 'Room Number Added!', type: 'SUCCESS' });
        setRoomNumberName('');
        refetchRoom();
      },
      onError: () => {
        showToast({ message: 'Error Adding Room Number', type: 'ERROR' });
      },
    }
  );

  const handleSave = (roomFormData: FormData) => {
    mutate(roomFormData);
  };

  const handleAddRoomNumber = () => {
    if (roomNumberName.trim() === '' || !roomId) return;

    addRoomNumber(roomNumberName);
  };

  const handleOutOfServiceChange = async (
    roomNumberId: string,
    isOutOfService: boolean
  ) => {
    try {
      await apiClient.updateRoomNumberOutOfService(
        roomId!,
        roomNumberId,
        isOutOfService
      );
      showToast({
        message: 'Room number out of service status updated successfully',
        type: 'SUCCESS',
      });
      refetchRoom();
    } catch (error) {
      showToast({
        message: 'Error updating room number out of service status',
        type: 'ERROR',
      });
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSection(expandedSection === sectionName ? '' : sectionName);
  };

  if (!roomId) {
    return <div>Room ID is missing.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="mb-8">
        <div
          className="cursor-pointer flex items-center mb-2"
          onClick={() => toggleSection('room')}
        >
          {expandedSection === 'room' ? (
            <FaChevronUp className="mr-2" />
          ) : (
            <FaChevronDown className="mr-2" />
          )}
          <h2 className="text-xl font-bold">Room Information</h2>
        </div>
        {expandedSection === 'room' && (
          <ManageRoomForm
            room={room}
            onSave={handleSave}
            isLoading={isLoading}
          />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Room Numbers</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Room Number Name"
            value={roomNumberName}
            onChange={(e) => setRoomNumberName(e.target.value)}
            className="border rounded w-full py-2 px-3 font-normal"
          />
          <button
            onClick={handleAddRoomNumber}
            disabled={isAddingRoomNumber}
            className="submit-btn"
          >
            {isAddingRoomNumber ? 'Adding...' : 'Add'}
          </button>
        </div>

        {room?.roomNumbers
          .filter((roomNumber) => roomNumber.deleted_at === null)
          .map((roomNumber) => (
            <div
              key={roomNumber._id}
              className="border border-slate-300 rounded-lg p-4 mb-4 flex justify-between items-center dark:bg-slate-800"
            >
              <h3 className="text-xl font-semibold dark:text-white">
                {roomNumber.roomNumberName}
              </h3>
              <div className='flex'>
                <label className='dark:text-white text-xl'>
                  <input
                    type="checkbox"
                    checked={roomNumber.isOutOfService}
                    onChange={(e) =>
                      handleOutOfServiceChange(roomNumber._id, e.target.checked)
                    }
                    className='mr-2'
                  />
                  Out of Service
                </label>
                <Link
                  to={`/edit-room-number/${roomNumber._id}`}
                  className="ml-2 edit-btn md:text-xl xs:whitespace-nowrap xs:text-sm dark:text-zinc-900 "
                >
                    <BiEditAlt size={25}/>
                </Link>
                <button
                  type="button"
                  className="bg-rose-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
                  onClick={toggleDeleteConfirmation}
                >
                   <BiTrashAlt size={25}/>
                </button>
              </div>
              {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
                  <div className="bg-white rounded-lg p-6">
                    <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                    <p>Are you sure you want to delete this <span className='text-red-500'>{roomNumber.roomNumberName}</span> RoomNumber?</p>
                    <div className="mt-4 flex justify-end">
                      <button
                        className="px-4 py-2 bg-gray-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-gray-600 rounded-md transition-colors ease-in duration-50"
                        onClick={toggleDeleteConfirmation}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-rose-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
                        onClick={() => deleteRoomNumber(roomNumber._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default EditRoom;
