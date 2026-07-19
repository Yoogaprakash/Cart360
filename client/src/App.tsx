import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { AppThemeProvider } from "./theme/ThemeModeContext";
import { AuthProvider } from "./store/AuthContext";
import { router } from "./app/router";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AppThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
