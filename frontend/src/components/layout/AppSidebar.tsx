import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, CheckSquare, ListTodo, Users, Gavel, Calendar,
    ScrollText, FileText, Files, Clock, Receipt, CreditCard,
    MessageSquare, Library, BarChart3, Settings, UserCircle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "To Do", path: "/todo", icon: ListTodo },
    { name: "Clients", path: "/clients", icon: Users },
    { name: "Litigation", path: "/litigation", icon: Gavel },
    { name: "Court Calendar", path: "/calendar", icon: Calendar },
    { name: "Cause List", path: "/cause-list", icon: ScrollText },
    { name: "Drafts", path: "/drafts", icon: FileText },
    { name: "Documents", path: "/documents", icon: Files },
    { name: "Time Tracking", path: "/time-tracking", icon: Clock },
    { name: "Billing", path: "/billing", icon: Receipt },
    { name: "Expenses", path: "/expenses", icon: CreditCard },
    { name: "Client Portal", path: "/client-portal", icon: UserCircle },
    { name: "Communication", path: "/communication", icon: MessageSquare },
    { name: "Research", path: "/research", icon: Library },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    isMobile: boolean;
}

export default function AppSidebar({ open, setOpen, isMobile }: SidebarProps) {
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && open && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
                    open ? "w-64 translate-x-0" : isMobile ? "-translate-x-full w-64" : "w-16 translate-x-0"
                )}
            >
                <div className="flex bg-sidebar text-sidebar-foreground h-14 items-center border-b px-4 justify-between">
                    {open && <h1 className="font-bold text-lg tracking-tight">VYISEDESK</h1>}
                    {!open && !isMobile && <span className="font-bold text-lg">VY</span>}

                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                        isActive ? "bg-accent/80 text-accent-foreground" : "text-muted-foreground",
                                        !open && !isMobile && "justify-center px-2"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    {open && <span>{item.name}</span>}
                                    {!open && !isMobile && <span className="sr-only">{item.name}</span>}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t">
                    {open && (
                        <div className="bg-muted/50 rounded-lg p-3 text-xs">
                            <p className="font-medium">Plan: Pro</p>
                            <div className="w-full bg-secondary h-1 mt-2 rounded">
                                <div className="bg-primary h-1 w-3/4 rounded"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Spacer for fixed sidebar */}
            <div className={cn("transition-all duration-300",
                open && !isMobile ? "w-64" : !isMobile ? "w-16" : "w-0"
            )} />
        </>
    );
}
