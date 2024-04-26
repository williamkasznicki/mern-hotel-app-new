import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../api-client';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { phoneCode } from '../../../backend/src/shared/phoneCode';

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [selectedPhone, setSelectedPhone] = useState<string>('');

  const getDefaultPhoneCountryCode = () => {

    const userLocale = navigator.language;
  
    const userCountryCode = userLocale.split('-')[1];
    
    const userPhoneCode = phoneCode.find(
      (phone) => phone.code === userCountryCode
    );
    
    setSelectedPhone(userPhoneCode?.dial_code || phoneCode[0].dial_code);
  };

  useEffect(() => {
    // Function to determine default country code based on user's local country
    getDefaultPhoneCountryCode();
  }, []);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const mutation = useMutation(apiClient.register, {
    onSuccess: async () => {
      showToast({ message: 'Registration Succeeded!', type: 'SUCCESS' });
      await queryClient.invalidateQueries('validateToken');
      navigate('/');
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: 'ERROR' });
    },
  });

  const onSubmit = handleSubmit((data) => {
    const formattedPhone = `${selectedPhone}${data.phone.toString()}`;
    //console.log(data) // (data) automatically comes from handleSubmit in react-hook-form
    const formData = { ...data, phone: formattedPhone };
    mutation.mutate(formData);
  });

  const handlePhoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhone(event.target.value);
  };

  return (
    <form className="flex flex-col gap-5 xs:px-4" onSubmit={onSubmit}>
      <h2 className="text-3xl font-bold">Create an Account</h2>
      <div className="flex flex-col md:flex-row gap-5">
        <label className="text-gray-700 text-sm font-bold flex-1">
          First Name
          <input
            className="border rounded w-full py-1 px-2 font-normal border-gray-500"
            {...register('firstName', {
              required: 'This field is required',
              maxLength: {
                value: 50,
                message: 'Maximum 50 characters!',
              },
            })}
          ></input>
          {errors.firstName && (
            <span className="text-red-500">{errors.firstName.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Last Name
          <input
            className="border rounded w-full py-1 px-2 font-normal border-gray-500"
            {...register('lastName', {
              required: 'This field is required',
              maxLength: {
                value: 50,
                message: 'Maximum 50 characters!',
              },
            })}
          ></input>
          {errors.lastName && (
            <span className="text-red-500">{errors.lastName.message}</span>
          )}
        </label>
      </div>

      <div className="grid md:grid-cols-6 xs:grid-cols-2 gap-5">
        <label className="text-gray-700 text-sm font-bold md:col-span-3 xs:col-span-2">
          Email
          <input
            type="email"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register('email', {
              required: 'This field is required',
              maxLength: {
                value: 200,
                message: 'Maximum 200 characters!',
              },
            })}
          ></input>
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </label>

        <label className="text-gray-700 text-sm font-bold md:col-span-1 xs:col-span-1">
          Country Code
          <select
            className="border rounded w-full py-1 px-2 font-normal"
            value={selectedPhone}
            onChange={handlePhoneChange}
          >
            {phoneCode.map((phone) => (
              <option key={phone.code} value={phone.dial_code}>
                {phone.name} ({phone.dial_code})
              </option>
            ))}
          </select>
        </label>

        <label className="text-gray-700 text-sm font-bold md:col-span-2 xs:col-span-1">
          Phone
          <input
            type="number"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register('phone', {
              required: 'This field is required',
              maxLength: {
                value: 12,
                message: 'Maximum 12 numbers!',
              },
            })}
          ></input>
          {errors.phone && (
            <span className="text-red-500">{errors.phone.message}</span>
          )}
        </label>
      </div>

      <label className="text-gray-700 text-sm font-bold flex-1">
        Password
        <input
          type="password"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register('password', {
            required: 'This field is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters!',
            },
            maxLength: {
              value: 50,
              message: 'Maximum 50 characters!',
            },
          })}
        ></input>
        {errors.password && (
          <span className="text-red-500">{errors.password.message}</span>
        )}
      </label>
      <label className="text-gray-700 text-sm font-bold flex-1">
        Confirm Password
        <input
          type="password"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register('confirmPassword', {
            validate: (val) => {
              if (!val) {
                return 'This field is required';
              } else if (watch('password') !== val) {
                return 'Your passwords do no match';
              }
            },
            maxLength: {
              value: 250,
              message: 'Maximum 250 characters!',
            },
          })}
        ></input>
        {errors.confirmPassword && (
          <span className="text-red-500">{errors.confirmPassword.message}</span>
        )}
      </label>
      <span>
        <button
          type="submit"
          className="bg-indigo-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50"
        >
          Create Account
        </button>
      </span>
      <span className="text-sm">
        Already have an account?{' '}
        <Link className="underline" to="/sign-in">
          Sign In
        </Link>
      </span>
    </form>
  );
};

export default Register;
