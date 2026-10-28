import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Users, Mail, Phone, ShieldCheck } from "lucide-react";
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
import { toast } from "sonner";

interface TeamMember {
    id: number;
    username: string;
    email: string;
    mobile?: string;
    role: string;
    role_id?: number;
    custom_role?: {
        name: string;
    }
}

interface Role {
    id: number;
    name: string;
}

export default function OrganizationTeam() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        mobile: "",
        password: "",
        role_id: ""
    });

    useEffect(() => {
        fetchTeam();
        fetchRoles();
    }, []);

    const fetchTeam = async () => {
        try {
            const response = await api.get("/org/team");
            setMembers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching team:", error);
            toast.error("Failed to load team members");
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get("/org/roles");
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const handleAdd = () => {
        setFormData({
            username: "",
            email: "",
            mobile: "",
            password: "",
            role_id: ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.username || !formData.email || !formData.password || !formData.role_id) {
            toast.error("All mandatory fields are required.");
            return;
        }

        try {
            await api.post("/org/team", formData);
            toast.success("Team member added successfully");
            fetchTeam();
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add team member");
        }
    };

    const filteredMembers = members.filter(m =>
        m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground">Manage your organization's staff and their access roles.</p>
                </div>
                <Button onClick={handleAdd} className="bg-foreground text-background">
                    <Plus className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center p-10">Loading team...</div>
                ) : filteredMembers.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                        <p className="text-muted-foreground">No team members found.</p>
                    </div>
                ) : (
                    filteredMembers.map(member => (
                        <div key={member.id} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                                    {member.username[0]}
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-foreground/5 rounded text-[10px] font-bold uppercase text-foreground/70 border">
                                    <ShieldCheck className="h-3 w-3" />
                                    {member.custom_role?.name || member.role}
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{member.username}</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    {member.email}
                                </div>
                                {member.mobile && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5" />
                                        {member.mobile}
                                    </div>
                                )}
                            </div>
                            <div className="mt-5 pt-4 border-t flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8">Edit</Button>
                                <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">Remove</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                            Create a new user account for your organization member.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username / Full Name</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Login Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Assign Role</Label>
                            <select
                                id="role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.role_id}
                                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                            >
                                <option value="">Select a Role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-foreground text-background">Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

