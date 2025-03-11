import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthProvider";

function PrivateRoute() {
    const auth = useAuth();
    return auth.token === null ? <Navigate to="/login" /> : <Outlet />;
}

export default PrivateRoute;
