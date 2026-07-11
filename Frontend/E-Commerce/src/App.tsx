import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { UIContextProvider } from "./context/UIContext";

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/otp-verify', '/reset-password'];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
    </UIContextProvider>
  )
}
