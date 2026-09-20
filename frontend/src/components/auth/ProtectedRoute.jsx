import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { getCurrentUser } from "../../services/auth.service";
import Loading from "../common/Loading";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await getCurrentUser();

        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  // Checking authentication
  if (isAuthenticated === null) {
    return <Loading />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Authenticated
  return <Outlet />;
};

export default ProtectedRoute;