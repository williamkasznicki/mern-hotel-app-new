import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../api-client';
import { useAppContext } from '../contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ForgotPassword from '../components/ForgotPassword';
import { useThemeMode } from 'flowbite-react';

export type SignInFormData = {
  email: string | undefined;
  password: string;
};

const SignIn = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
const { mode } = useThemeMode();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInFormData>();

  const mutation = useMutation(apiClient.signIn, {
    onSuccess: async () => {
      showToast({ message: 'Sign in Successful!', type: 'SUCCESS' });
      await queryClient.invalidateQueries('validateToken');

      navigate('/');
      window.location.reload();
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: 'ERROR' });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className="grid xs:grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="dark:bg-slate-800 p-4 rounded-md duration-300">
        {showForgotPassword ? (
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        ) : (
          <form className="flex flex-col gap-5 xs:px-2" onSubmit={onSubmit}>
            <h2 className="text-3xl font-bold dark:text-white duration-300">Sign In</h2>
            <label className="text-gray-700 text-sm font-bold flex-1 dark:text-white duration-300">
              Email
              <input
                type="email"
                className="border border-slate-300 rounded w-full h-10 py-1 px-2 font-normal text-gray-700"
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
            <label className="text-gray-700 text-sm font-bold flex-1 dark:text-white duration-300">
              Password
              <input
                type="password"
                className="border border-slate-300 rounded w-full h-10 py-1 px-2 font-normal text-gray-700"
                {...register('password', {
                  required: 'This field is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters!',
                  },
                  maxLength: {
                    value: 150,
                    message: 'Maximum 150 characters!',
                  },
                })}
              ></input>
              {errors.password && (
                <span className="text-red-500">{errors.password.message}</span>
              )}
            </label>
            <span className="flex items-center justify-between dark:text-white duration-300">
              <span className="text-sm">
                Not Registered?{' '}
                <Link className="underline" to="/register">
                  Create an account here
                </Link>
              </span>
              <button
                type="submit"
                className="bg-indigo-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50"
              >
                Login
              </button>
            </span>
            <span className="-mt-4 text-sm text-gray-600 dark:text-white duration-300">
              Forgot password?{' '}
              <button
                type="button"
                className="text-rose-500 hover:text-rose-600"
                onClick={handleForgotPasswordClick}
              >
                Reset password
              </button>
            </span>
          </form>
        )}
      </div>
      <div className="place-self-center xs:hidden w-full h-full lg:block">
        <img
          src={mode === "dark" ? "redloop.gif" : "SignInGif.gif"}
          className="rounded-md w-full h-[320px] object-cover object-center "
          alt=""
        />
      </div>
    </div>
  );
};

export default SignIn;
