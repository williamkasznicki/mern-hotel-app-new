import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppContextProvider } from './contexts/AppContext.tsx';
import { SearchContextProvider } from './contexts/SearchContext.tsx';
import { Flowbite } from 'flowbite-react';

// this function preventing the default behavior of react-query that it will automatically do a retry if there an Error
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <SearchContextProvider>
          <Flowbite>
            <App />
          </Flowbite>
        </SearchContextProvider>
      </AppContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
