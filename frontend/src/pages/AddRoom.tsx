import { useMutation } from 'react-query';
import ManageRoomForm from '../forms/ManageRoomForm/ManageRoomForm';
import { useAppContext } from '../contexts/AppContext';
import * as apiClient from '../api-client';
import { useNavigate, useParams } from 'react-router-dom';

const AddRoom = () => {
  const { showToast } = useAppContext();
  const { hotelId } = useParams<{ hotelId: string }>();

  const navigate = useNavigate();

  if (!hotelId) {
    return null;
  }

  const { mutate, isLoading } = useMutation(
    (roomFormData: FormData) => apiClient.addMyRoom(hotelId, roomFormData),
    {
      onSuccess: () => {
        showToast({ message: 'Room Saved!', type: 'SUCCESS' });
        navigate(`/edit-hotel/${hotelId}`);
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          showToast({ message: error.message, type: 'ERROR' });
        } else {
          showToast({ message: 'An unknown error occurred', type: 'ERROR' });
        }
      },
    }
  );

  const handleSave = (roomFormData: FormData) => {
    mutate(roomFormData);
  };

  return <ManageRoomForm onSave={handleSave} isLoading={isLoading} />;
};

export default AddRoom;
