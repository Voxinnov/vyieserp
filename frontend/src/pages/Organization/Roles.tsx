import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, ArrowLeft, Shield } from "lucide-react";
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
import { toast } from "sonner";

interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: any[];
}

const modules = [
    { key: "dashboard", label: "Dashboard" },
    { key: "tasks", label: "Tasks" },
    { key: "todo", label: "To Do" },
    { key: "clients", label: "Clients" },
    { key: "litigation", label: "Litigation" },
    { key: "drafts", label: "Drafts" },
    { key: "calendar", label: "Calendar" },
    { key: "billing", label: "Billing" },
    { key: "settings", label: "Settings" }
];

const permissionTypes = [
    { key: "read", label: "View" },
    { key: "create", label: "Create" },
    { key: "update", label: "Edit" },
    { key: "delete", label: "Delete" }
];

export default function OrganizationRoles() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<Partial<Role>>({
        name: "",
        permissions: []
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get("/org/roles");
            setRoles(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast.error("Failed to load roles");
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingRole(null);
        setFormData({ name: "", permissions: [] });
        setIsDialogOpen(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({ ...role });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Role name is required");
            return;
        }

        try {
            if (editingRole) {
                await api.put(`/org/roles/${editingRole.id}`, formData);
                toast.success("Role updated successfully");
            } else {
                await api.post("/org/roles", formData);
                toast.success("Role created successfully");
            }
            fetchRoles();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving role:", error);
            toast.error("Failed to save role");
        }
    };

    const togglePermission = (moduleKey: string, typeKey: string, checked: boolean) => {
        const currentPermissions = [...(formData.permissions || [])];
        const moduleIndex = currentPermissions.findIndex(p => p.page === moduleKey);

        if (moduleIndex > -1) {
            currentPermissions[moduleIndex] = {
                ...currentPermissions[moduleIndex],
                [typeKey]: checked
            };
        } else {
            currentPermissions.push({
                page: moduleKey,
                read: typeKey === 'read' ? checked : false,
                create: typeKey === 'create' ? checked : false,
                update: typeKey === 'update' ? checked : false,
                delete: typeKey === 'delete' ? checked : false
            });
        }
        setFormData({ ...formData, permissions: currentPermissions });
    };

    const isChecked = (moduleKey: string, typeKey: string) => {
        const perm = formData.permissions?.find((p: any) => p.page === moduleKey);
        return perm ? perm[typeKey] : false;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Define what your team members can see and do.</p>
                </div>
                <Button onClick={handleAdd} className="bg-foreground text-background">
                    <Plus className="mr-2 h-4 w-4" /> Create New Role
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            <th className="h-12 px-4 text-left font-medium">Role Name</th>
                            <th className="h-12 px-4 text-left font-medium">Permissions</th>
                            <th className="h-12 px-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} className="p-8 text-center">Loading...</td></tr>
                        ) : roles.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No roles created yet.</td></tr>
                        ) : (
                            roles.map(role => (
                                <tr key={role.id} className="border-b transition-colors hover:bg-muted/30">
                                    <td className="p-4 font-semibold">{role.name}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions?.map((p: any) => (
                                                <span key={p.page} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] uppercase font-bold">
                                                    {p.page}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive">
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                        <DialogDescription>
                            Enter the role name and select the permissions for this role.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="roleName">Role Name</Label>
                            <Input
                                id="roleName"
                                placeholder="e.g. Junior Advocate, Accountant, Receptionist"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold border-b pb-2 uppercase tracking-widest text-muted-foreground">Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modules.map(module => (
                                    <div key={module.key} className="p-4 border rounded-lg bg-muted/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="h-4 w-4 text-primary" />
                                            <h4 className="font-bold capitalize">{module.label}</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {permissionTypes.map(type => (
                                                <div key={type.key} className="flex items-center space-x-2 bg-background p-2 rounded border">
                                                    <Checkbox
                                                        id={`${module.key}-${type.key}`}
                                                        checked={isChecked(module.key, type.key)}
                                                        onCheckedChange={(checked) => togglePermission(module.key, type.key, checked as boolean)}
                                                    />
                                                    <label htmlFor={`${module.key}-${type.key}`} className="text-xs font-medium cursor-pointer">
                                                        {type.label}
                                                    </label>
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
                        <Button onClick={handleSave} className="bg-foreground text-background">
                            {editingRole ? "Update Role" : "Create Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

