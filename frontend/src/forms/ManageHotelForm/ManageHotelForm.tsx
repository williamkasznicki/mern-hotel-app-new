import { FormProvider, useForm } from 'react-hook-form';
import { HotelType } from '../../../../backend/src/shared/types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DetailsSection from './DetailsSection';
import TypeSection from './TypeSection';
import FacilitiesSection from './FacilitiesSection';
//import GuestsSection from './GuestsSection';
import ImagesSection from './ImagesSection';

export type HotelFormData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  address: string;
  landmarks: { name: string; distance: string }[];
  allFacilities: string[];
  coordinate: string[];
  starRating: number;
  startingPrice: number;
  imageFiles: FileList | null;
  imageUrls: string[];
};

type Props = {
  hotel?: HotelType;
  onSave: (hotelFormData: FormData) => void;
  isLoading: boolean;
  editMode?: boolean;
};

const ManageHotelForm = ({
  hotel,
  onSave,
  isLoading,
  editMode: initialEditMode = true,
}: Props) => {
  const formMethods = useForm<HotelFormData>();
  const { handleSubmit, reset, watch } = formMethods;
  const [editMode, setEditMode] = useState(initialEditMode);
  const location = useLocation();

  useEffect(() => {
    if (hotel) {
      const formData: HotelFormData = {
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        description: hotel.description,
        type: hotel.type,
        address: hotel.address,
        landmarks: hotel.landmarks as { name: string; distance: string }[],
        allFacilities: hotel.allFacilities,
        coordinate: hotel.coordinate,
        starRating: hotel.starRating,
        startingPrice: hotel.startingPrice,
        imageFiles: [] as unknown as FileList,
        imageUrls: hotel.imageUrls,
      };
      reset(formData);
    }
  }, [hotel, reset]);

  const onSubmit = handleSubmit((formDataJson: HotelFormData) => {
    const formData = new FormData();

    let latitude = '';
    let longitude = '';

    // const coordinateValue = watch('coordinate');
    // const [latitude, longitude] = coordinateValue;

    if (formDataJson.coordinate && formDataJson.coordinate.length === 2) {
      [latitude, longitude] = formDataJson.coordinate;
    }

    if (hotel) {
      formData.append('hotelId', hotel._id);
    }

    formData.append('name', formDataJson.name);
    formData.append('city', formDataJson.city);
    formData.append('country', formDataJson.country);
    formData.append('description', formDataJson.description);
    formData.append('type', formDataJson.type);
    formData.append('address', formDataJson.address);
    formData.append('starRating', formDataJson.starRating.toString());
    formData.append('coordinate[0]', latitude.trim());
    formData.append('coordinate[1]', longitude.trim());

    formDataJson.landmarks.forEach((landmark, index) => {
      formData.append(`landmarks[${index}][name]`, landmark.name);
      formData.append(`landmarks[${index}][distance]`, landmark.distance);
    });

    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    if (formDataJson.imageFiles) {
      Array.from(formDataJson.imageFiles).forEach((imageFile) => {
        formData.append(`imageFiles`, imageFile);
      });
    }

    onSave(formData);
  });

  return (
    <FormProvider {...formMethods}>
      <form
        className="flex flex-col gap-10 xs:mx-3 md:mx-0 bg-gray-100 dark:bg-zinc-800 p-10 rounded-md"
        onSubmit={onSubmit}
      >
        <DetailsSection hotel={hotel} editMode={editMode} />
        <TypeSection editMode={editMode} />
        <FacilitiesSection allFacilities={hotel?.allFacilities} />
        <ImagesSection editMode={editMode} />
        <span className="flex justify-between gap-6">
        
          {location.pathname !== '/add-hotel' && (
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="edit-btn w-1/4  xs:w-full"
            >
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          )}
          <button
            disabled={!editMode || isLoading}
            type="submit"
            className="primary-btn w-1/4  xs:w-full"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageHotelForm;
