import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { useSearchContext } from '../../contexts/SearchContext';
import { useAppContext } from '../../contexts/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type Props = {
  startingPrice: number;
  onBookNowClick: () => void;
  isRoomsAvailable: boolean;
};

type GuestInfoFormData = {
  roomId: string;
  roomNumberName: string;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
};

const GuestInfoForm = ({
  startingPrice,
  onBookNowClick,
  isRoomsAvailable,
}: Props) => {
  const search = useSearchContext();
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    defaultValues: {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adultCount: search.adultCount,
      childCount: search.childCount,
    },
  });

  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  useEffect(() => {
    setValue('checkIn', search.checkIn);
    setValue('checkOut', search.checkOut);
  }, [search.checkIn, search.checkOut, setValue]);

  const onSignInClick = (data: GuestInfoFormData) => {
    search.saveSearchValues(
      '',
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount,
      data.roomId,
      data.roomNumberName
    );
    navigate('/sign-in', { state: { from: location } });
  };

  const onSubmit = (data: GuestInfoFormData) => {
    if (data.checkOut.toDateString() === data.checkIn.toDateString()) {
      alert('Please choose at least one night.');
      return;
    }

    search.saveSearchValues(
      '',
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount,
      data.roomId,
      data.roomNumberName
    );
    onBookNowClick();
  };

  return (
    <div className="flex flex-col p-4 bg-blue-200 dark:bg-indigo-400 gap-5 rounded-sm">
      <h3 className="text-lg font-bold">
        ฿{startingPrice ? startingPrice : 0} /Night
      </h3>
      <form
        onSubmit={
          isLoggedIn ? handleSubmit(onSubmit) : handleSubmit(onSignInClick)
        }
      >
        <div className="grid grid-cols-1 gap-4 items-center">
          <div>
            <DatePicker
              required
              selected={checkIn}
              onChange={(date) => setValue('checkIn', date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-in Date"
              className="min-w-full border-none bg-white p-2 focus:outline-none"
              wrapperClassName="min-w-full"
            />
          </div>
          <div>
            <DatePicker
              required
              selected={checkOut}
              onChange={(date) => setValue('checkOut', date as Date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Check-in Date"
              className="min-w-full border-none bg-white p-2 focus:outline-none"
              wrapperClassName="min-w-full"
            />
          </div>
          <div className="flex bg-white px-2 py-1 gap-2">
            <label className="items-center flex">
              Adults:
              <input
                className="w-full p-1 focus:outline-none font-bold border-none"
                type="number"
                min={1}
                max={20}
                {...register('adultCount', {
                  required: 'This field is required',
                  min: {
                    value: 1,
                    message: 'There must be at least one adult',
                  },
                  valueAsNumber: true,
                })}
              />
            </label>
            <label className="items-center flex">
              Children:
              <input
                className="w-full p-1 focus:outline-none font-bold border-none"
                type="number"
                min={0}
                max={20}
                {...register('childCount', {
                  valueAsNumber: true,
                })}
              />
            </label>
            {errors.adultCount && (
              <span className="text-red-500 font-semibold text-sm">
                {errors.adultCount.message}
              </span>
            )}
          </div>
          {isLoggedIn ? (
            <button
              type="button"
              disabled={!isRoomsAvailable}
              className={
                isRoomsAvailable == false
                  ? 'bg-gray-400  text-white h-full p-2 font-bold text-xl cursor-not-allowed'
                  : 'bg-indigo-600 text-white h-full p-2 font-bold hover:bg-indigo-500 dark:hover:bg-rose-500 text-xl active:scale-95 transition-all duration-300 ease-in-out'
              }
              onClick={handleSubmit(onSubmit)}
            >
              {isRoomsAvailable == false
                ? 'No rooms available! or try change the Date.'
                : 'See available room!'}
            </button>
          ) : (
            <button
              type="button"
              className="bg-indigo-600 dark:bg-rose-300 text-white h-full p-2 font-bold hover:bg-indigo-500 text-xl"
              onClick={handleSubmit(onSignInClick)}
            >
              Sign in to Book
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GuestInfoForm;
