import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from '@/contexts/AuthContext'; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import OrderNotificationDisplay from "@/components/OrderNotificationDisplay";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import ProtectedUserRoute from "@/components/ProtectedUserRoute";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { ThemeToggle } from "@/components/ThemeToggle"; 

// Public Pages
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import OrderPage from "./pages/OrderPage";
import CoffeeGuidePage from "./pages/CoffeeGuidePage";
import GalleryPage from "./pages/GalleryPage";
import OurStoryPage from "./pages/OurStoryPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FeedbackPage from "./pages/FeedbackPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";

// Checkout Flow
import CustomerInfo from "./components/CustomerInfo"; 
import Billing from "./components/Billing"; 
import Payment from "./components/Payment"; 
import OrderSuccess from "./components/OrderSuccess";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage"; 
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage"; 
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminCoffeeGuide from "./pages/admin/AdminCoffeeGuidePage"; 
import GalleryManager from "./components/admin/GalleryManager";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div 
      suppressHydrationWarning 
      className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300"
    >
      {!isAdminRoute && (
        <div className="sticky top-0 z-[100] w-full shadow-sm bg-background">
          <AnnouncementBanner />
          <Header />
        </div>
      )}

      {/* Manual Theme Toggle - Now hidden on Admin routes */}
      {!isAdminRoute && (
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}

      {!isAdminRoute && <CartDrawer />}
      
      <main className="flex-1 flex flex-col relative z-10">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/coffee-guide" element={<CoffeeGuidePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          
          {/* Checkout Flow */}
          <Route path="/checkout" element={<CustomerInfo />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected User Route */}
          <Route path="/profile" element={<ProtectedUserRoute />}>
            <Route index element={<ProfilePage />} />
          </Route>
          
          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="stock" element={<AdminInventoryPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="gallery" element={<GalleryManager />} /> 
            <Route path="announcements" element={<AdminAnnouncementsPage />} /> 
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="coffee-guide" element={<AdminCoffeeGuide />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <CartProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <OrderNotificationDisplay />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </NotificationProvider>
        </CartProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;