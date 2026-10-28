import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Role {
    id: number;
    name: string;
    description: string;
    usersCount: number;
    permissions?: Record<string, any>;
}

// Module configuration for permissions
const modules = [
    { key: "tasks", label: "Tasks" },
    { key: "todos", label: "To Do" },
    { key: "clients", label: "Clients" },
    { key: "litigation", label: "Litigation" },
    { key: "calendar", label: "Calendar" },
    { key: "causeList", label: "Cause List" },
    { key: "drafts", label: "Drafts" },
    { key: "documents", label: "Documents" },
    { key: "timeTracking", label: "Time Tracking" },
    { key: "billing", label: "Billing" },
    { key: "expenses", label: "Expenses" },
    { key: "clientPortal", label: "Client Portal" },
    { key: "communication", label: "Communication" },
    { key: "research", label: "Research" },
    { key: "reports", label: "Reports" },
    { key: "settings", label: "Settings" }
];

const permissionTypes = [
    { key: "create", label: "Create" },
    { key: "edit", label: "Edit" },
    { key: "view", label: "View" },
    { key: "delete", label: "Delete" }
];

export default function UserRoles() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<Partial<Role>>({});

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get("/roles");
            setRoles(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching roles:", error);
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAdd = () => {
        setEditingRole(null);
        setFormData({ name: "", description: "", permissions: {} });
        setIsDialogOpen(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({ ...role, permissions: role.permissions || {} });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this role?")) {
            try {
                await api.delete(`/roles/${id}`);
                setRoles(roles.filter(r => r.id !== id));
            } catch (error) {
                console.error("Error deleting role:", error);
                alert("Failed to delete role");
            }
        }
    };

    const handleSave = async () => {
        if (!formData.name) return;

        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, formData);
                fetchRoles();
            } else {
                await api.post("/roles", formData);
                fetchRoles();
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving role:", error);
            alert("Failed to save role");
        }
    };

    const handlePermissionChange = (moduleKey: string, typeKey: string, checked: boolean) => {
        const currentPermissions = formData.permissions || {};
        const modulePermissions = currentPermissions[moduleKey] || {};

        setFormData({
            ...formData,
            permissions: {
                ...currentPermissions,
                [moduleKey]: {
                    ...modulePermissions,
                    [typeKey]: checked
                }
            }
        });
    };

    const handleScopeChange = (moduleKey: string, typeKey: string, value: string) => {
        const currentPermissions = formData.permissions || {};
        const modulePermissions = currentPermissions[moduleKey] || {};

        setFormData({
            ...formData,
            permissions: {
                ...currentPermissions,
                [moduleKey]: {
                    ...modulePermissions,
                    [`${typeKey}_scope`]: value
                }
            }
        });
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Roles</h1>
                    <p className="text-muted-foreground">Manage user roles and permissions.</p>
                </div>
                <div className="ml-auto">
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Role
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Users</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center">Loading roles...</td>
                                </tr>
                            ) : filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center">No roles found.</td>
                                </tr>
                            ) : (
                                filteredRoles.map((role) => (
                                    <tr key={role.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{role.name}</td>
                                        <td className="p-4 align-middle">{role.description}</td>
                                        <td className="p-4 align-middle">{role.usersCount}</td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(role.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                        <DialogDescription>
                            Define permissions for this role across different modules.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-medium text-lg border-b pb-2">Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {modules.map((module) => (
                                    <div key={module.key} className="border rounded-lg p-4 space-y-4">
                                        <h4 className="font-semibold text-base">{module.label}</h4>
                                        <div className="space-y-3">
                                            {permissionTypes.map((type) => (
                                                <div key={type.key} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${module.key}-${type.key}`}
                                                            checked={formData.permissions?.[module.key]?.[type.key] || false}
                                                            onCheckedChange={(checked) => handlePermissionChange(module.key, type.key, checked as boolean)}
                                                        />
                                                        <label
                                                            htmlFor={`${module.key}-${type.key}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {type.label} {module.label}
                                                        </label>
                                                    </div>

                                                    {/* Scope Dropdown - visible only if permission is checked */}
                                                    {formData.permissions?.[module.key]?.[type.key] && (
                                                        <select
                                                            className="h-8 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            value={formData.permissions?.[module.key]?.[`${type.key}_scope`] || "everything"}
                                                            onChange={(e) => handleScopeChange(module.key, type.key, e.target.value)}
                                                        >
                                                            <option value="everything">Everything</option>
                                                            <option value="self">Self Only</option>
                                                        </select>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
