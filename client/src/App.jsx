import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingState from "./components/LoadingState.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";

const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const BoardDetailsPage = lazy(() => import("./pages/BoardDetailsPage.jsx"));
const BoardsPage = lazy(() => import("./pages/BoardsPage.jsx"));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const TaskDetailsPage = lazy(() => import("./pages/TaskDetailsPage.jsx"));

const App = () => {
  return (
    <Suspense fallback={<LoadingState label="Loading page" />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/boards" element={<BoardsPage />} />
            <Route path="/boards/:boardId" element={<BoardDetailsPage />} />
            <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
