
import * as React from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DogsList } from './pages/DogsList';
import { Finance } from './pages/Finance';
import { Users } from './pages/Users';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Inventory } from './pages/Inventory';
import { History } from './pages/History';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useApp();
  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="dogs" element={<DogsList />} />
        <Route path="finance" element={<Finance />} />
        <Route path="users" element={<Users />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
