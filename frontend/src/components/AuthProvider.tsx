import { InternalAxiosRequestConfig } from "axios";
import {
    Children,
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
} from "react";
import api from "../api/axiosInstance";

enum Role {
    UNDERGRAD,
    GRAD,
    ADMIN,
}

interface authContext {
    token: string | null | undefined;
    role: Role | null;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const AuthContext = createContext<authContext>({ token: null, role: null });

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null | undefined>();
    const [role, setRole] = useState<null | Role>(null);

    useEffect(() => {
        const refreshToken = async () => {
            try {
                const response = await api.post<{ access: string }>(
                    "auth/token/refresh/"
                ); // This request would automatically contain the HTTP-ONLY cookie refresh token
                setToken(response.data.access);
            } catch {
                setToken(null);
            }
        };
        refreshToken();
    }, []);

    useLayoutEffect(() => {
        const authRequestInterceptor = api.interceptors.request.use(
            (config: CustomAxiosRequestConfig) => {
                if (token && !config._retry)
                    config.headers.Authorization = `Bearer ${token}`;
                return config;
            }
        );

        return () => {
            api.interceptors.request.eject(authRequestInterceptor);
        };
    }, [token]);

    useLayoutEffect(() => {
        const authResponseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest: CustomAxiosRequestConfig = error.config;

                if (
                    error.response.status === 403 &&
                    error.response.message === "Unauthorized"
                ) {
                    try {
                        const response = await api.post<{ access: string }>(
                            "auth/token/refresh/"
                        );
                        setToken(response.data.access);

                        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                        originalRequest._retry = true;

                        return api(originalRequest);
                    } catch {
                        setToken(null);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(authResponseInterceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ token: token, role: null }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
export const useAuth = () => {
    return useContext(AuthContext);
};
