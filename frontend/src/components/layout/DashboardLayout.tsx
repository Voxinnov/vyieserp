import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop state
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar Wrapper */}
            <AppSidebar open={sidebarOpen} setOpen={setSidebarOpen} isMobile={isMobile} />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20 focus:outline-none">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
