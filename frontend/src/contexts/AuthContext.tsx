import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Define user roles type
export type UserRole = string; // Relaxed from specific union due to inconsistencies

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    organization_id?: number;
    role_id?: number;
    permissions?: any[];
    avatar?: string;
    username?: string;
    token?: string;
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
        const storedUser = localStorage.getItem("user");
        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                }
            } else {
                // Mock user restoration fallback (only if nothing stored)
                setUser({
                    id: 1,
                    name: "John Doe",
                    email: "admin@vyisedesk.com",
                    role: "super_admin"
                });
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("access_token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
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
