import React, { useContext, useState } from 'react';
import Toast from '../components/Toast';
import { useQuery } from 'react-query';
import * as apiClient from '../api-client';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || '';

type ToastMessage = {
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING';
};

type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  stripePromise: Promise<Stripe | null>;
  isSuperAdmin: boolean;
};

const AppContext = React.createContext<AppContext | undefined>(undefined);

const stripePromise = loadStripe(STRIPE_PUB_KEY);

/* **********************************************************************
 *                            AppContext
 ********************************************************************** */

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode; // this is the TS in line type instead of create a separate type.
}) => {
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);

  // since the validate-token api will throw out an error if there an error, so we can assign that error to the variable
  const { isError } = useQuery('validateToken', apiClient.verifyToken, {
    retry: false,
  });

  const { data: user } = useQuery(
    'fetchCurrentUser',
    () => apiClient.fetchCurrentUser(),
    { retry: false, enabled: !isError }
  );

  return (
    <AppContext.Provider
      value={{
        showToast: (toastMessage) => {
          setToast(toastMessage);
        },
        isLoggedIn: !isError,
        stripePromise,
        isSuperAdmin: user?.isSuperAdmin || false,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)}
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContext;
};
