import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import * as apiClient from '../api-client';
import { useAppContext } from '../contexts/AppContext';

type ForgotPasswordFormData = {
  email: string;
};

type ForgotPasswordProps = {
  onBack: () => void;
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const { showToast } = useAppContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const mutation = useMutation(
    (email: string) => apiClient.forgotPassword(email),
    {
      onSuccess: () => {
        showToast({
          message: 'Password reset email sent. Please check your inbox.',
          type: 'SUCCESS',
        });
        onBack();
      },
      onError: (error: Error) => {
        showToast({ message: error.message, type: 'ERROR' });
      },
    }
  );

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data.email);
  });

  return (
    <form className="flex flex-col gap-5 xs:px-2" onSubmit={onSubmit}>
      <h2 className="text-3xl font-bold dark:text-white">Forgot Password</h2>
      <label className="text-gray-700 text-sm font-bold flex-1 dark:text-white">
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
      <div className="flex justify-between">
        <button
          type="button"
          className="text-gray-800 hover:text-gray-600 dark:text-white dark:hover:text-white/50 underline font-bold"
          onClick={onBack}
        >
          Back to Sign In
        </button>
        <button
          type="submit"
          className="bg-indigo-500 text-white h-full p-2 font-bold text-xl active:scale-95 hover:bg-indigo-600 rounded-md transition-colors ease-in duration-50"
        >
          Reset Password
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;
