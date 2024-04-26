import { useFormContext } from 'react-hook-form';
import { HotelFormData } from './ManageHotelForm';
import { Tooltip } from 'react-tooltip';

interface Props {
  editMode?: boolean;
  allFacilities?: string[];
}

const FacilitiesSection = ({ allFacilities }: Props) => {
  const {
    formState: { errors },
  } = useFormContext<HotelFormData>();

  return (
    <div
      className="cursor-not-allowed "
      data-tooltip-id="allFacilities-tooltip"
      data-tooltip-content="This field is automatically updated when you create, update, or delete rooms."
      data-tooltip-place="top"
      data-tooltip-delay-show={700}
    >
      <h2 className="text-2xl font-bold mb-3 dark:text-white ">Facilities</h2>
      {allFacilities && allFacilities.length > 0 ? (
        <div className="grid md:grid-cols-5 gap-3 content-center text-nowrap xs:grid-cols-2 p-2">
          {allFacilities.map((facility, index) => (
            <span
              className="text-md border border-slate-400 dark:text-white dark:bg-slate-700 rounded-sm p-2 whitespace-nowrap truncate"
              key={index}
            >
              {facility}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-700 dark:text-white">No facilities available.</p>
      )}
      {errors.allFacilities && (
        <span className="text-red-500 text-sm font-bold">
          {errors.allFacilities.message}
        </span>
      )}
      <Tooltip id="allFacilities-tooltip" />
    </div>
  );
};

export default FacilitiesSection;
