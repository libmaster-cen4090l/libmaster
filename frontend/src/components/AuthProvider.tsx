/**
 * Authentication provider 
 *
 * Context provider for authentication-related functionality
 * Manages user authentication state, token handling, and API authorization.
 *
 * Author(s): Ivan Lepesii, Dylan Connolly
 * Modified: 3/3/2025 @ 3:44:59 EST by Dylan 
 *
 * MODIFICATIONS:
 * - Made some changes to token refresh for further maintenance of authentication across
 *   page refreshes
 * - Enhanced request interceptor to only add Authorization header when token exists
 * - Updated dependency tracking to properly respond to token changes 
 * - Improved error handling for authentication failures
 * - Generally, just added more documentation that explains the flow of the authentication 
 *     api and how auth requests are handled between refreshes
 *
 * @context 
 * @requires React 
 * @requires axios 
 * @requires ../api/axiosInstance 
 */ 

import { AxiosError, InternalAxiosRequestConfig } from "axios";
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

interface Errors {
    incorrectCredentials: boolean;
}

interface authContext {
    token: string | null | undefined;
    role: Role | null;
    errors: Errors;
    clearToken: (() => void) | null;
    login:
        | (({}: {
              email: string | null;
              password: string | null;
          }) => Promise<void>)
        | null;
    signup:
        | (({}: {
              email: string | null;
              password: string | null;
          }) => Promise<void>)
        | null;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const AuthContext = createContext<authContext>({
    token: null,
    role: null,
    clearToken: null,
    login: null,
    signup: null,
    errors: { incorrectCredentials: false },
});


/**
 * Authentication Provider Component
 *
 * Provides authentication context to the application, managing:
 * - Token storage and retrieval
 * - User login and signup functionality 
 * - Automatic token refresh 
 * - API request authorization 
 *
 * @param {Object} props - Component props 
 * @param {ReactNode} props.children - Child components to be wrapped
 */
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null | undefined>();
    const [role, setRole] = useState<null | Role>(null);
    const [errors, setErrors] = useState<Errors>({
        incorrectCredentials: false,
    });

    const clearTokenFunction = () => {
        setToken(null);
    };

    const login = async (form: {
        email: string | null;
        password: string | null;
    }) => {
        if (!form.email || !form.password) return;
        try {
            setErrors({ incorrectCredentials: false });
            const response = await api.post("auth/token/", {
                username: form.email,
                password: form.password,
            });
            setToken(response.data.access);
        } catch (e) {
            if (e instanceof AxiosError && e.status == 401)
                setErrors({ ...errors, incorrectCredentials: true });
            setToken(null);
        }
    };

    const signup = async (form: {
        email: string | null;
        password: string | null;
    }) => {
        if (!form.email || !form.password) return;
        try {
            setErrors({ incorrectCredentials: false });
            const response = await api.post("auth/signup/", {
                username: form.email,
                password: form.password,
            });
            setToken(response.data.access);
        } catch (e) {
            if (e instanceof AxiosError && e.status == 401)
                setErrors({ ...errors, incorrectCredentials: true });
            setToken(null);
        }
    };

    /**
     * Attempts to refresh the authentication token on page load/refresh 
     * This ensures user sessions persist across page reloads (while working
     *   on reservations flow, I had issues with authentication persisting
     *   across browser page refreshes. I don't know much about this, but
     *   I did some reading online and this [seems] to have fixed it, idk)
     *
     * ADDED: this effect is crucial for maintaining authentication state 
     */
    useEffect(() => 
    {
      const handlePageLoad = async () => 
      {
        try 
        {
          // try to refresh the token on page load/refresh
          const response = await api.post<{ access: string }>("auth/token/refresh/");
          setToken(response.data.access);
        } 
        catch (error) 
        {
          // if refresh fails, redirect to login
          setToken(null);
        }
      };

      // execute token refresh on page load
      handlePageLoad();
    }, []);


    /**
     * Intercepts API requests to add authentication token 
     *
     * MODIFIED: Now properly depends on token state and only adds
     *   Authorization header when token exists
     */ 
    useLayoutEffect(() => 
    {
      const authRequestInterceptor = api.interceptors.request.use(
        (config) => 
        {
          // only add the token if it exists
          if (token) 
          {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        }
      );

      return () => 
      {
        api.interceptors.request.eject(authRequestInterceptor);
      };
    }, [token]); // depend on token so it updates when token changes

    /**
     * Intercepts API responses to handle authentication errors 
     * Attempts to refresh the token if a request fails due to authorization 
     */
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
        <AuthContext.Provider
            value={{
                token: token,
                role: null,
                errors: errors,
                clearToken: clearTokenFunction,
                login: login,
                signup: signup,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

/**
 * Hook to access the authentication context 
 *
 * @returns {authContext} The authentication context value
 */
export const useAuth = () => {
    return useContext(AuthContext);
};
