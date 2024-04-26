import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { HotelFormData } from './ManageHotelForm';
import { HotelType } from '../../../../backend/src/shared/types';
import { Tooltip } from 'react-tooltip';
import JoditEditor from 'jodit-react';

type Props = {
  hotel?: HotelType;
  editMode?: boolean;
};

const DetailsSection = ({ hotel, editMode }: Props) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  const debounce = (func: (content: string) => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (newContent: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(newContent), delay);
    };
  };

  const {
    fields: landmarkFields,
    append: appendLandmark,
    remove: removeLandmark,
  } = useFieldArray({
    control,
    name: 'landmarks',
    rules: {
      validate: (landmarks: { name: string; distance: string }[]) =>
        landmarks.length <= 30 || 'Maximum 30 landmarks allowed',
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-3 dark:text-white">
        {hotel ? 'Edit Hotel' : 'Add Hotel'}
      </h1>
      <label className="text-zinc-700 text-sm font-bold flex-1 dark:text-white">
        Name
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal dark:text-zinc-800 bg-white"
          {...register('name', {
            required: 'This field is required',
            maxLength: {
              value: 100,
              message: 'Maximum 100 characters!',
            },
          })}
          disabled={!editMode}
        ></input>
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </label>

      <div className="flex gap-4">
        <label className="text-zinc-700 dark:text-white text-sm font-bold flex-1">
          City
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal dark:text-zinc-800 bg-white"
            {...register('city', {
              required: 'This field is required',
              maxLength: {
                value: 100,
                message: 'Maximum 100 characters!',
              },
            })}
            disabled={!editMode}
          ></input>
          {errors.city && (
            <span className="text-red-500">{errors.city.message}</span>
          )}
        </label>
        <label className="text-gray-700 dark:text-white text-sm font-bold flex-1">
          Country
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal bg-white dark:text-zinc-800"
            {...register('country', {
              required: 'This field is required',
              maxLength: {
                value: 100,
                message: 'Maximum 100 characters!',
              },
            })}
            disabled={!editMode}
          ></input>
          {errors.country && (
            <span className="text-red-500">{errors.country.message}</span>
          )}
        </label>
      </div>
      <label className="text-gray-700 dark:text-zinc-800 text-sm font-bold flex-1">
        Description
        <Controller
          control={control}
          name="description"
          rules={{
            required: 'This field is required',
            maxLength: {
              value: 6000,
              message: 'Maximum 6000 characters!',
            },
          }}
          render={({ field }) => (
            <JoditEditor
              className="text-zinc-800"
              ref={field.ref}
              value={field.value}
              onBlur={field.onBlur}
              onChange={debounce((newContent: string) => {
                field.onChange(newContent);
              }, 99000)}
              config={{
                readonly: !editMode,

                buttons: [
                  'bold',
                  'italic',
                  'underline',
                  'strikethrough',
                  'eraser',
                  '|',
                  'ul',
                  'ol',
                  '|',
                  'font',
                  'fontsize',
                  'brush',
                  'paragraph',
                  '|',
                  'table',
                  'link',
                  '|',
                  'left',
                  'center',
                  'right',
                  'justify',
                  '|',
                  'undo',
                  'redo',
                  'selectall',
                  'cut',
                  'copy',
                  'paste',
                ],
                disablePlugins: ['image'],
              }}
            />
          )}
        />
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="text-gray-700 dark:text-white  text-sm font-bold">
          Staring Price <small>(hover to see tooltip)</small>
          <input
            type="number"
            min={1}
            className="border rounded w-full py-1 px-2 font-normal cursor-not-allowed bg-zinc-700 text-white dark:text-zinc-800"
            {...register('startingPrice')}
            disabled={true}
            data-tooltip-id="startingPrice-tooltip"
            data-tooltip-content="This field is automatically updated when you create, update, or delete rooms."
            data-tooltip-place="top"
            data-tooltip-delay-show={700}
          ></input>
          {errors.startingPrice && (
            <span className="text-red-500">{errors.startingPrice.message}</span>
          )}
        </label>
        <Tooltip id="startingPrice-tooltip" />

        <label className="text-gray-700 dark:text-white  text-sm font-bold">
          Star Rating
          <input
            type="number"
            min={1}
            max={5}
            disabled={!editMode}
            className="border rounded w-full py-1 px-2 font-normal dark:text-zinc-800"
            {...register('starRating')}
            // disabled={true}
            data-tooltip-id="starRating-tooltip"
            data-tooltip-content="This Star Rating will not revelant by Star Rating of customer reviews."
            data-tooltip-place="top"
            data-tooltip-delay-show={700}
          ></input>
          {errors.starRating && (
            <span className="text-red-500">{errors.starRating.message}</span>
          )}
        </label>
        <Tooltip id="starRating-tooltip" />
      </div>

      <label className="text-gray-700 text-sm font-bold flex-1 dark:text-white">
        Address
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal dark:text-zinc-800 bg-white"
          {...register('address', { required: 'This field is required' })}
          disabled={!editMode}
        />
        {errors.address && (
          <span className="text-red-500">{errors.address.message}</span>
        )}
      </label>

      <div className="flex gap-4">
        <label className="text-gray-700 dark:text-white  text-sm font-bold flex-1">
          Latitude <small>(optional)</small>
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal dark:text-zinc-800 bg-white"
            {...register('coordinate.0')}
            disabled={!editMode}
          />
          {errors.coordinate?.[0] && (
            <span className="text-red-500">{errors.coordinate[0].message}</span>
          )}
        </label>
        <label className="text-gray-700 dark:text-white  text-sm font-bold flex-1">
          Longitude <small>(optional)</small>
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal dark:text-zinc-800 bg-white"
            {...register('coordinate.1')}
            disabled={!editMode}
          />
          {errors.coordinate?.[1] && (
            <span className="text-red-500">{errors.coordinate[1].message}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-700 dark:text-white  text-sm font-bold">
          Landmarks <small>( Kilometers distance from your hotel )</small>
        </label>
        {landmarkFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              type="text"
              placeholder="Landmark name"
              className="border rounded w-full py-1 px-2 font-normal bg-white"
              {...register(`landmarks.${index}.name`)}
              disabled={!editMode}
            />
            <input
              type="text"
              placeholder="Distance"
              className="border rounded w-full py-1 px-2 font-normal bg-white"
              {...register(`landmarks.${index}.distance`)}
              disabled={!editMode}
            />
            {editMode && (
              <button
                type="button"
                onClick={() => removeLandmark(index)}
                className="bg-red-500 text-white px-2 rounded"
              >
                Remove
              </button>
            )}
            {errors.landmarks && (
              <span className="text-red-500">{errors.landmarks.message}</span>
            )}
          </div>
        ))}
        {editMode && (
          <button
            type="button"
            onClick={() => appendLandmark({ name: '', distance: '' })}
            disabled={landmarkFields.length >= 50}
            className="primary-btn"
          >
            Add Landmark
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailsSection;
