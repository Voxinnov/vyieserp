import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Define user roles type
export type UserRole = "super_admin" | "advocate" | "associate" | "clerk" | "accountant" | "client";

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Simulate fetching user from token on load
        const storedToken = localStorage.getItem("access_token");
        if (storedToken) {
            // TODO: Validate token with backend /me endpoint
            // For now, we simulate a user if token exists
            setToken(storedToken);
            // Mock user restoration (in production, fetch this)
            if (!user) {
                setUser({
                    id: 1,
                    name: "John Doe",
                    email: "admin@vyisedesk.com",
                    role: "super_admin" // Default for dev
                });
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("access_token", newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("access_token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
