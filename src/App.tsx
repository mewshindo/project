import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CataloguePage from './pages/catalogue/CataloguePage';
import CartPage from './pages/catalogue/CartPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import AdminPage from './pages/admin/AdminPage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useAuth } from './contexts/AuthContext';

// Auth route wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App layout with navbar and footer
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Auth pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Main app routes */}
              <Route 
                path="/" 
                element={
                  <AppLayout>
                    <Navigate to="/catalogue" replace />
                  </AppLayout>
                } 
              />
              
              <Route 
                path="/catalogue" 
                element={
                  <AppLayout>
                    <CataloguePage />
                  </AppLayout>
                } 
              />
              
              <Route 
                path="/reviews" 
                element={
                  <AppLayout>
                    <ReviewsPage />
                  </AppLayout>
                } 
              />
              
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CartPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout>
                      <AdminPage />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all */}
              <Route 
                path="*" 
                element={
                  <AppLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Страницы не существует</h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Этой страницы не существует или она находится по другому адресу.
                      </p>
                      <a 
                        href="/catalogue" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                      >
                        Перейти в каталог
                      </a>
                    </div>
                  </AppLayout>
                } 
              />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;