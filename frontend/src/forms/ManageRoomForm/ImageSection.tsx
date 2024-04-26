import { useFormContext } from 'react-hook-form';
import { RoomFormData } from './ManageRoomForm';

const ImagesSection = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useFormContext<RoomFormData>();

  const existingImageUrls = watch('imageUrls') ?? [];

  const handleDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    imageUrl: string
  ) => {
    event.preventDefault();
    setValue(
      'imageUrls',
      existingImageUrls.filter((url) => url !== imageUrl)
    );
    trigger('imageFiles'); // Trigger vali dation after updating imageUrls
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">
        Images <small>(maximum 5MB /img)</small>
      </h2>
      <div className="border rounded p-4 flex flex-col gap-4 bg-white">
        {existingImageUrls && (
          <div className="grid grid-cols-6 gap-4">
            {existingImageUrls.map((url, index) => (
              <div className="relative group" key={index}>
                <img
                  src={url}
                  className="min-h-full object-cover"
                  alt={'room images'}
                />
                <button
                  onClick={(event) => handleDelete(event, url)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full text-gray-700 font-normal"
          {...register('imageFiles', {
            validate: (imageFiles) => {
              const imageFilesArray = Array.from(imageFiles ?? []);
              const totalLength =
                imageFilesArray.length + existingImageUrls?.length;

              if (totalLength === 0) {
                return 'At least one image should be added';
              }

              if (totalLength > 6) {
                return 'Total number of images cannot be more than 6';
              }
              const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
              for (const file of imageFilesArray) {
                if (file.size > maxSizeInBytes) {
                  return `File ${file.name} exceeds the maximum allowed size of 5 MB`;
                }
              }

              return true;
            },
          })}
        />
      </div>
      {errors.imageFiles && (
        <span className="text-red-500 text-sm font-bold">
          {errors.imageFiles.message}
        </span>
      )}
    </div>
  );
};

export default ImagesSection;
