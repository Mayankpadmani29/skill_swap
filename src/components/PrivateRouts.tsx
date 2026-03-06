// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  if (!isAuthenticated()) return <Navigate to="/signin" replace />;
  return children;
};

export default PrivateRoute;
