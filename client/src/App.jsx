import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const EntryFormPage = lazy(() => import('./pages/EntryFormPage'));
const EntryViewPage = lazy(() => import('./pages/EntryViewPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const Loading = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '60vh', color: 'var(--color-text-secondary)'
  }}>
    Loading...
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/entry/new" element={
            <ProtectedRoute><EntryFormPage /></ProtectedRoute>
          } />
          <Route path="/entry/:id/edit" element={
            <ProtectedRoute><EntryFormPage /></ProtectedRoute>
          } />
          <Route path="/entry/:id" element={<EntryViewPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
