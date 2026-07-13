// ────────────────────────────────────────────────────────────
// App — Router + Providers
// ────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import ProductWizard from './pages/ProductWizard';
import MediaLibrary from './pages/MediaLibrary';
import Quotes from './pages/Quotes';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Marketing from './pages/Marketing';
import Notifications from './pages/Notifications';
import Inventory from './pages/Inventory';
import Pincodes from './pages/Pincodes';
import Settings from './pages/Settings';
import Users from './pages/Users';
import RolesPermissions from './pages/RolesPermissions';
import { NotFoundPage, ServerErrorPage, NetworkErrorPage, SessionExpiredPage, PermissionDeniedPage } from './pages/ErrorPages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', fontSize: '14px', maxWidth: '400px' },
            success: { iconTheme: { primary: '#F97316', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductWizard />} />
            <Route path="products/:id" element={<ProductWizard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brands />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="pincodes" element={<Pincodes />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="marketing" element={<Marketing />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<RolesPermissions />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
