import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthProvider";

function PrivateRoute() {
    const auth = useAuth();
    console.log(auth);
    return auth.token === null ? <Navigate to="/login" /> : <Outlet />;
}

export default PrivateRoute;
