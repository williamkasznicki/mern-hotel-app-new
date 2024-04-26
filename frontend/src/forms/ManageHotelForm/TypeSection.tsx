import { useFormContext } from "react-hook-form";
import { hotelTypes } from "../../config/options-config";
import { HotelFormData } from "./ManageHotelForm";

interface Props {
  editMode?: boolean;
}

const TypeSection = ({ editMode }: Props) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  const typeWatch = watch("type");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3 dark:text-white ">Type</h2>
      <div className="grid md:grid-cols-5 gap-2 xs:grid-cols-3 ">
        {hotelTypes.map((type, index) => (
          <label
            className={
              typeWatch === type
                ? "cursor-pointer bg-blue-300 text-sm rounded-full px-4 py-2 font-semibold truncate"
                : "cursor-pointer bg-slate-300 text-sm rounded-full px-4 py-2 font-semibold truncate"}
            key={index}
          >
            <input
              type="radio"
              value={type}
              {...register("type", {
                required: "This field is required",
              })}
              className="hidden"
              disabled={!editMode}
            />
            <span className="truncate">{type}</span>
          </label>
        ))}
      </div>
      {errors.type && (
        <span className="text-red-500 text-sm font-bold">
          {errors.type.message}
        </span>
      )}
    </div>
  );
};

export default TypeSection;
