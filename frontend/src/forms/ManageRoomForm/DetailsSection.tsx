import { useFormContext } from 'react-hook-form';
import { RoomFormData } from './ManageRoomForm';
import { RoomType } from '../../../../backend/src/shared/types';

type Props = {
  room?: RoomType;
};

const DetailsSection = ({ room }: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<RoomFormData>();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-3">
        {room ? 'Edit Room' : 'Add Room'}
      </h1>
      <label className="text-gray-700 text-sm font-bold flex-1">
        Room Type
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register('roomType', { required: 'This field is required' })}
        />
        {errors.roomType && (
          <span className="text-red-500">{errors.roomType.message}</span>
        )}
      </label>

      <label className="text-gray-700 text-sm font-bold flex-1">
        Description
        <textarea
          rows={5}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register('description', { required: 'This field is required' })}
        />
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </label>

      <label className="text-gray-700 text-sm font-bold flex-1">
        Price Per Night
        <input
          type="number"
          min={1}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register('pricePerNight', {
            required: 'This field is required',
            min: {
              value: 1,
              message: 'Price per night must be greater than or equal to 1',
            },
          })}
        />
        {errors.pricePerNight && (
          <span className="text-red-500">{errors.pricePerNight.message}</span>
        )}
      </label>
    </div>
  );
};

export default DetailsSection;
