import { useFormContext } from "react-hook-form";
import { RoomFormData } from "./ManageRoomForm";

const GuestsSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<RoomFormData>();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Max Guests</h2>
      <div className="grid grid-cols-2 p-6 gap-5 bg-indigo-300">
        <label className="text-gray-700 text-sm font-semibold">
          Max Adults
          <input
            className="border rounded w-full py-2 px-3 font-normal disabled:bg-gray-300"
            type="number"
            min={1}
            max={100}
            {...register("maxAdult", {
              required: "This field is required",
            })}
            
          />
          {errors.maxAdult?.message && (
            <span className="text-red-500 text-sm fold-bold">
              {errors.maxAdult?.message}
            </span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-semibold">
         Max Children
          <input
            className="border rounded w-full py-2 px-3 font-normal disabled:bg-gray-300"
            type="number"
            min={0}
            max={10}
            {...register("maxChild", {
              required: "This field is required",
            })}
            
          />
          {errors.maxChild?.message && (
            <span className="text-red-500 text-sm fold-bold">
              {errors.maxChild?.message}
            </span>
          )}
        </label>
      </div>
    </div>
  );
};

export default GuestsSection;
