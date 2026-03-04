import { RouterProvider } from 'react-router';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { AppProvider } from '@/app/context/AppContext';
import { TelegramProvider } from '@/app/context/TelegramContext';
import { router } from '@/app/routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ThemeProvider>
      <TelegramProvider>
        <AppProvider>
          <RouterProvider router={router} />
          <Toaster position="top-center" richColors />
        </AppProvider>
      </TelegramProvider>
    </ThemeProvider>
  );
}
