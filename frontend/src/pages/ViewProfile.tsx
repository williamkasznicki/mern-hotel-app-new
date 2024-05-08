import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as apiClient from '../api-client';
import { useAppContext } from '../contexts/AppContext';
import { UserType } from '../../../backend/src/shared/types';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { phoneCode } from '../../../backend/src/shared/phoneCode';
import { Spinner } from 'flowbite-react';

export type EditProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  oldPassword: string;
  password: string;
  confirmPassword: string;
};

const ViewProfile = () => {
  const { showToast } = useAppContext();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string>('');

  const { data: currentUser, isLoading } = useQuery<UserType>(
    'fetchCurrentUser',
    apiClient.fetchCurrentUser
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
    },
  });

  const updateProfileMutation = useMutation(
    (userData: EditProfileFormData) => apiClient.updateMe(userData),
    {
      onSuccess: () => {
        showToast({
          message: 'Profile updated successfully!',
          type: 'SUCCESS',
        });
        queryClient.invalidateQueries('fetchCurrentUser');
        setIsEditing(false);
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          showToast({ message: error.message, type: 'ERROR' });
        } else {
          showToast({ message: 'An unknown error occurred', type: 'ERROR' });
        }
      },
    }
  );

  const onSubmit = handleSubmit((data) => {
    const formattedPhone = `${selectedPhone}${data.phone}`;
    const formData = { ...data, phone: formattedPhone };

    const updatedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== currentUser![key as keyof UserType]) {
        acc[key as keyof EditProfileFormData] = value;
      }
      return acc;
    }, {} as Partial<EditProfileFormData>);

    if (Object.keys(updatedData).length === 0) {
      showToast({
        message: 'No changes made to the profile',
        type: 'WARNING',
      });
      return;
    }

    updateProfileMutation.mutate(updatedData as EditProfileFormData);
  });

  const handlePhoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhone(event.target.value);
  };

  return (
    <>
      {isLoading ? (
        <Spinner
          color="purple"
          aria-label="Purple spinner"
          size={'xl'}
          className="mx-auto"
        />
      ) : (
        <div className="dark:bg-slate-800 p-5 rounded-md duration-300">
          <h2 className="text-2xl font-bold mb-4 dark:text-white duration-300">Profile</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-1 dark:text-white duration-300">
                First Name
              </label>
              <input
                type="text"
                {...register('firstName')}
                className="border rounded w-full py-2 px-3"
                readOnly={!isEditing}
                defaultValue={currentUser?.firstName}
                tabIndex={1}
                placeholder={currentUser?.firstName}
              />
              {errors.firstName && (
                <span className="text-red-500">{errors.firstName.message}</span>
              )}
            </div>

            <div>
              <label className="block font-bold mb-1 dark:text-white duration-300">
                Last Name
              </label>
              <input
                type="text"
                {...register('lastName')}
                className="border rounded w-full py-2 px-3"
                readOnly={!isEditing}
                defaultValue={currentUser?.lastName}
                tabIndex={2}
                placeholder={currentUser?.lastName}
              />
              {errors.lastName && (
                <span className="text-red-500">{errors.lastName.message}</span>
              )}
            </div>
            <div>
              <label className="block font-bold mb-1 dark:text-white duration-300">
                Email
              </label>
              <div className="flex items-center">
                <input
                  type="email"
                  {...register('email')}
                  className={`border rounded w-full py-2 px-3 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  readOnly={!isEditing}
                  defaultValue={currentUser?.email}
                  tabIndex={3}
                  placeholder={currentUser?.email}
                />
                {currentUser?.isEmailVerified ? (
                  <FaCheckCircle
                    className="text-green-500 ml-2"
                    size={25}
                    title="Email has been verified"
                  />
                ) : (
                  <FaTimesCircle
                    className="text-red-500 ml-2"
                    size={25}
                    title="Email is not verified"
                  />
                )}
                {!currentUser?.isEmailVerified && (
                  <button
                    type="button"
                    className="bg-green-500 text-white whitespace-nowrap py-2 px-4 rounded hover:bg-teal-600 ml-2"
                    onClick={() => {
                      apiClient.sendVerificationEmail(currentUser?.email || '');
                      showToast({
                        message:
                          'Verification email sent. Please check your inbox.',
                        type: 'SUCCESS',
                      });
                    }}
                  >
                    Verify Email
                  </button>
                )}
              </div>
              {errors.email && (
                <span className="text-red-500">{errors.email.message}</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {isEditing && (
                <label className="text-blacktext-sm font-bold md:col-span-1 xs:col-span-1 self-center dark:text-white duration-300">
                  Country Code
                  <select
                    className="border rounded w-full py-2 px-3 font-normal text-black"
                    value={selectedPhone}
                    onChange={handlePhoneChange}
                    disabled={!isEditing}
                  >
                    {phoneCode.map((phone) => (
                      <option key={phone.code} value={phone.dial_code}>
                        {phone.name} ({phone.dial_code})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label
                className={`font-bold mb-1 dark:text-white duration-300 ${
                  isEditing ? 'col-span-3' : 'col-span-4'
                }`}
              >
                Phone
                <input
                  type="text"
                  {...register('phone')}
                  className={`border rounded w-full py-2 px-3 font-normal dark:text-gray-800 duration-300 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  readOnly={!isEditing}
                  defaultValue={currentUser?.phone}
                  tabIndex={4}
                  placeholder={currentUser?.phone}
                />
                {errors.phone && (
                  <span className="text-red-500">{errors.phone.message}</span>
                )}
              </label>
            </div>
            {isEditing && (
              <>
                <div>
                  <label className="block font-bold mb-1 dark:text-white duration-300">
                    Old Password
                  </label>
                  <input
                    type="password"
                    {...register('oldPassword')}
                    className="border rounded w-full py-2 px-3"
                    tabIndex={5}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 dark:text-white">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    className="border rounded w-full py-2 px-3"
                    tabIndex={5}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 dark:text-white duration-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      validate: (value) =>
                        value === watch('password') || 'Passwords do not match',
                    })}
                    className={`border rounded w-full py-2 px-3 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                    tabIndex={6}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </>
            )}
            {isEditing ? (
              <div>
                <button
                  type="submit"
                  className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 mr-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  tabIndex={7}
                  disabled={!isDirty}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default ViewProfile;
