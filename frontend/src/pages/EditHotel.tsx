import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import * as apiClient from '../api-client';
import ManageHotelForm from '../forms/ManageHotelForm/ManageHotelForm';
import { useAppContext } from '../contexts/AppContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiEditAlt, BiTrashAlt } from 'react-icons/bi';

const EditHotel = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string>('hotel');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const toggleDeleteConfirmation = () => {
    setShowDeleteConfirmation(!showDeleteConfirmation);
  };

  const { data: hotel } = useQuery(
    'fetchMyHotelById',
    () => apiClient.fetchMyHotelById(hotelId || ''),
    {
      enabled: !!hotelId,
    }
  );

  const { data: rooms } = useQuery(
    'fetchHotelRooms',
    () => apiClient.fetchMyHotelRooms(hotelId || ''),
    {
      enabled: !!hotelId,
    }
  );

  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
    onSuccess: () => {
      showToast({ message: 'Hotel Saved!', type: 'SUCCESS' });
      setEditMode(false);
      window.location.reload();
    },
    onError: () => {
      showToast({ message: 'Error Saving Hotel', type: 'ERROR' });
    },
  });

  const deleteRoomNumber = async (roomId: string) => {
    try {
      await apiClient.deleteMyRoomById(roomId!);
      showToast({
        message: 'Room deleted successfully',
        type: 'SUCCESS',
      });
      window.location.reload();
    } catch (error) {
      showToast({ message: 'Error deleting Room', type: 'ERROR' });
    }
  };

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSection(expandedSection === sectionName ? '' : sectionName);
  };

  return (
    <>
      <div className="mb-8">
        <div
          className="cursor-pointer flex items-center mb-2"
          onClick={() => toggleSection('hotel')}
        >
          {expandedSection === 'hotel' ? (
            <FaChevronUp className="mr-2" />
          ) : (
            <FaChevronDown className="mr-2" />
          )}
          <h2 className="text-xl font-bold">Hotel Information</h2>
        </div>
        {expandedSection === 'hotel' && (
          <ManageHotelForm
            hotel={hotel}
            onSave={handleSave}
            isLoading={isLoading}
            editMode={editMode}
          />
        )}
      </div>

      <div>
        <div
          className="cursor-pointer flex items-center mb-2"
          onClick={() => toggleSection('rooms')}
        >
          {expandedSection === 'rooms' ? (
            <FaChevronUp className="mr-2" />
          ) : (
            <FaChevronDown className="mr-2" />
          )}
          <h2 className="text-xl font-bold">Room Types</h2>
        </div>
        {expandedSection === 'rooms' && (
          <div>
            {location.pathname !== '/add-hotel' && hotel && (
              <Link
                to={`/add-room/${hotel._id}`}
                type="button"
                className="bg-indigo-500 float-right xs:w-full md:w-32 mb-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50 text-center"
              >
                Add Room
              </Link>
            )}
            {rooms
              ?.filter((room) => room.deleted_at === null)
              .map((room) => (
                <div
                  key={room._id}
                  className="border border-slate-300 dark:bg-slate-800 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 w-full items-center"
                >
                  <div className="xs:col-span-1 md:col-span-2">
                    <h3 className="text-xl font-semibold dark:text-white">{room.roomType}</h3>
                    <span className="text-lg dark:text-white">{room.pricePerNight} THB</span>
                    <p className="line-clamp-1 dark:text-white">{room.description}</p>
                    <div className="mt-2">
                      {room.roomFacilities
                        .slice(0, 3)
                        .map((facility, index) => (
                          <span
                            key={index}
                            className="m-1 bg-slate-300 p-2 rounded-lg font-bold text-xs whitespace-nowrap"
                          >
                            {facility}
                          </span>
                        ))}
                      <span className="text-sm dark:text-white">
                        {room.roomFacilities.length > 3 &&
                          `+${room.roomFacilities.length - 3} more`}
                      </span>
                    </div>
                  </div>

                  <div className="md:visible xs:invisible font-thin dark:text-white">
                    All Room:{room.roomNumbers.length}
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to={`/edit-room/${room._id}`}
                      className="edit-btn md:text-xl xs:whitespace-nowrap xs:text-sm"
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
                    {showDeleteConfirmation && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
                        <div className="bg-white rounded-lg p-6">
                          <h2 className="text-lg font-bold mb-4">
                            Confirm Delete
                          </h2>
                          <p>
                            Are you sure you want to delete this <span className='text-red-500'>{room.roomType}</span> Room?
                          </p>
                          <div className="mt-4 flex justify-end">
                            <button
                              className="px-4 py-2 bg-gray-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-gray-600 rounded-md transition-colors ease-in duration-50"
                              onClick={toggleDeleteConfirmation}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-rose-500 ml-2 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-rose-600 rounded-md transition-colors ease-in duration-50"
                              onClick={() => deleteRoomNumber(room._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EditHotel;
