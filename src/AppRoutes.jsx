import { Routes, Route } from 'react-router-dom';
import AuthLayout from './pages/Auth/AuthLayout';
import Dashboard from './pages/Dashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />} />
      <Route path="/login" element={<AuthLayout />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}