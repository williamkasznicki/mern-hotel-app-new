import { useMutation } from 'react-query';
import ManageHotelForm from '../forms/ManageHotelForm/ManageHotelForm';
import { useAppContext } from '../contexts/AppContext';
import * as apiClient from '../api-client';
import { useNavigate } from 'react-router-dom';

const AddHotel = () => {
  const { showToast } = useAppContext();
  
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
    onSuccess: () => {
      showToast({ message: 'Hotel Saved!', type: 'SUCCESS' });
      navigate('/my-hotels');
    },
    onError: (error) => {
      let errorMessage = 'Error Adding new Hotel!';
      // Check if the error has a message property
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      showToast({ message: errorMessage, type: 'ERROR' });
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return (
    <ManageHotelForm
      onSave={handleSave}
      isLoading={isLoading}
      editMode={true}
    />
  );
};

export default AddHotel;
