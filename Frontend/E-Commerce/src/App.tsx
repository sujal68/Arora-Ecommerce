import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { UIContextProvider } from "./context/UIContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/otp-verify', '/reset-password'];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("[LOG] [FRONTEND] App component mounted / location changed:", location.pathname);
    const token = localStorage.getItem('adminAuthToken');
    const isPublic = PUBLIC_ROUTES.includes(location.pathname);

    if (location.pathname === '/') {
      navigate(token ? '/dashboard' : '/login', { replace: true });
    } else if (token && isPublic) {
      navigate('/dashboard', { replace: true });
    } else if (!token && !isPublic) {
      navigate('/login', { replace: true });
    }
  }, [location.pathname])

  return (
    <UIContextProvider>
      <Outlet />
      <ToastContainer position="top-right" autoClose={3000} />
    </UIContextProvider>
  )
}
