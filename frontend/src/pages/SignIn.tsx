import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../api-client';
import { useAppContext } from '../contexts/AppContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export type SignInFormData = {
  email: string | undefined;
  password: string;
};

const SignIn = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const location = useLocation();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInFormData>();

  const mutation = useMutation(apiClient.signIn, {
    onSuccess: async () => {
      showToast({ message: 'Sign in Successful!', type: 'SUCCESS' });
      await queryClient.invalidateQueries('validateToken');
      navigate(location.state?.from?.pathname || '/');
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: 'ERROR' });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <div className='grid xs:grid-cols-1 lg:grid-cols-2 gap-4'>
      <div>
        <form className="flex flex-col gap-5 xs:px-2" onSubmit={onSubmit}>
          <h2 className="text-3xl font-bold">Sign In</h2>
          <label className="text-gray-700 text-sm font-bold flex-1">
            Email
            <input
              type="email"
              className="border border-slate-300 rounded w-full h-10 py-1 px-2 font-normal"
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
          <label className="text-gray-700 text-sm font-bold flex-1">
            Password
            <input
              type="password"
              className="border border-slate-300 rounded w-full h-10 py-1 px-2 font-normal"
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
          <span className="flex items-center justify-between">
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
        </form>
      </div>
      <div className='place-self-center xs:hidden lg:block'>
        <img src="https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className='rounded-md' alt="" />
      </div>
    </div>
  );
};

export default SignIn;
