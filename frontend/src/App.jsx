// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './pages/DashboardLayout';
import MyTasksPage from './pages/MyTasksPage';
import NewTaskPage from './pages/NewTaskPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersListPage from './pages/UsersListPage';
import PublicTasksPage from './pages/PublicTasksPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<MyTasksPage />} />
        <Route path="tasks/new" element={<NewTaskPage />} />
        <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="users/:userId/public-tasks" element={<PublicTasksPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
