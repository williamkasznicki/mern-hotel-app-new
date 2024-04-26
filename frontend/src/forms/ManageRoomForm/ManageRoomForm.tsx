import { FormProvider, useForm } from 'react-hook-form';
import { RoomType } from '../../../../backend/src/shared/types';
import { useEffect } from 'react';
import DetailsSection from './DetailsSection';
import ImagesSection from './ImageSection';
import GuestsSection from './GuestSection';
import FacilitiesSection from './FacilitiesSection';

export type RoomFormData = {
  roomType: string;
  description: string;
  pricePerNight: number;
  roomFacilities: string[];
  maxAdult: number;
  maxChild: number;
  imageFiles: FileList;
  imageUrls: string[];
};

type Props = {
  room?: RoomType;
  onSave: (roomFormData: FormData) => void;
  isLoading: boolean;
};

const ManageRoomForm = ({ room, onSave, isLoading }: Props) => {
  const formMethods = useForm<RoomFormData>();
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    if (room) {
      const formData: RoomFormData = {
        roomType: room.roomType,
        description: room.description,
        pricePerNight: room.pricePerNight,
        roomFacilities: room.roomFacilities,
        maxAdult: room.maxAdult,
        maxChild: room.maxChild,
        imageFiles: [] as unknown as FileList,
        imageUrls: room.imageUrls,
      };
      reset(formData);
    }
  }, [room, reset]);

  const onSubmit = handleSubmit((formDataJson: RoomFormData) => {
    const formData = new FormData();

    if (room) {
      formData.append('roomId', room._id);
    }

    formData.append('roomType', formDataJson.roomType.toString());
    formData.append('description', formDataJson.description.toString());
    formData.append('pricePerNight', formDataJson.pricePerNight.toString());
    formDataJson.roomFacilities.forEach((facility) => {
      formData.append('roomFacilities[]', facility);
    });
    formData.append('maxAdult', formDataJson.maxAdult.toString());
    formData.append('maxChild', formDataJson.maxChild.toString());

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
        className="flex flex-col gap-10 xs:mx-3 md:mx-0 bg-gray-100 p-10 rounded-md"
        onSubmit={onSubmit}
      >
        <DetailsSection room={room} />
        <FacilitiesSection />
        <GuestsSection />
        <ImagesSection />
        <span className="flex justify-between gap-5">
          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-indigo-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-400 rounded-md transition-colors ease-in duration-50 disabled:bg-gray-500"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageRoomForm;
