import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

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

// Layout that conditionally renders Navbar on non-login pages
const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const hideNav = pathname === '/login';

  return (
    <>
      {!hideNav && <Navbar />}
      {children}
    </>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Layout>
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
      </Layout>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
