import { useFormContext } from 'react-hook-form';
import { roomFacilities } from '../../config/options-config';
import { RoomFormData } from './ManageRoomForm';
import { useState, ChangeEvent } from 'react';

const FacilitiesSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<RoomFormData>();

  const [checkAll, setCheckAll] = useState(false);

  const handleCheckAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setCheckAll(isChecked);
    const facilityCheckboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="roomFacilities"]'
    );
    facilityCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Facilities</h2>
      {/* Check All checkbox */}
      <label className="text-sm flex gap-1 text-gray-700">
        <input
          type="checkbox"
          checked={checkAll}
          onChange={handleCheckAllChange}
        />
        Select All
      </label>
      <div className="grid md:grid-cols-5 gap-3 content-center text-nowrap xs:grid-cols-3 ">
        {roomFacilities.map((facility, index) => (
          <label className="text-sm flex gap-1 text-gray-700" key={index}>
            <input
              type="checkbox"
              value={facility}
              {...register('roomFacilities', {
                validate: (facilities) => {
                  if (facilities && facilities.length > 0) {
                    return true;
                  } else {
                    return 'At least one facility is required';
                  }
                },
              })}
            />
            {facility}
          </label>
        ))}
      </div>
      {errors.roomFacilities && (
        <span className="text-red-500 text-sm font-bold">
          {errors.roomFacilities.message}
        </span>
      )}
    </div>
  );
};

export default FacilitiesSection;
