import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { WorkflowListPage } from '../features/workflows/WorkflowListPage';
import { WorkflowEditorPage } from '../features/workflows/WorkflowEditorPage';
import { ExecutionListPage } from '../features/executions/ExecutionListPage';
import { ExecutionDetailPage } from '../features/executions/ExecutionDetailPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/workflows"
            element={
              <ProtectedRoute>
                <WorkflowListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/:id"
            element={
              <ProtectedRoute>
                <WorkflowEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/:id/executions"
            element={
              <ProtectedRoute>
                <ExecutionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executions/:id"
            element={
              <ProtectedRoute>
                <ExecutionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/workflows" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
