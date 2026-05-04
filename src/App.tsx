import { Suspense } from "react";
import { ToastContainer } from "./components/ui/ToastContainer";
import { useToastStore } from "./hooks/useToast";
import { QuickActionFAB } from "./components/common/QuickActionFAB";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { LoadingFallback } from "./components/ui/LoadingFallback";
import { AppRouter } from "./app/router/AppRouter";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useAuthStore } from "./store/useAuthStore";

export default function App() {
  const { toasts, removeToast } = useToastStore();
  const { isAuthenticated } = useAuthStore();
  const { isLoading } = useAuth();
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AppRouter />
      </Suspense>

      <ToastContainer toasts={toasts} onClose={removeToast} />
      {!isLoading && isAuthenticated && <QuickActionFAB />}
    </ErrorBoundary>
  );
}
