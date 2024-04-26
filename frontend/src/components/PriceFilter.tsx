import { useState } from 'react';

type Props = {
  selectedPrice?: number;
  onChange: (value?: number) => void;
  className?: string;
};

const PriceFilter = ({ selectedPrice, onChange }: Props) => {
  const [currentValue, setCurrentValue] = useState(selectedPrice || 0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(parseInt(event.target.value));
  };

  const handleMouseUp = () => {
    onChange(currentValue);
  };

  return (
    <div>
      <label className="text-md font-semibold mb-2">Max Price</label>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min={0}
          max={100000}
          step={100}
          value={currentValue}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer 
          [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(37,99,315,0.8)]
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:w-2.5
          [&::-webkit-slider-thumb]:h-2.5
          [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:dark:bg-slate-800"
        />
        <span className="text-sm font-bold">{currentValue} THB</span>
      </div>
    </div>
  );
};

export default PriceFilter;
