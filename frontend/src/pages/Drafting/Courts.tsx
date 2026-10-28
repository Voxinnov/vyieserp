
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, MapPin, Trash2, Edit, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Court {
    id: number;
    courtName: string;
    courtType: string;
    city: string;
    state: string;
    address: string;
    jurisdiction?: string;
}

export default function Courts() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState<Court | null>(null);
    const [formData, setFormData] = useState({
        courtName: "",
        courtType: "District Court",
        city: "",
        state: "",
        address: "",
        jurisdiction: ""
    });

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchCourts();
    }, []);

    const fetchCourts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/courts");
            setCourts(response.data);
        } catch (error) {
            toast.error("Failed to load courts");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCourt) {
                await api.put(`/courts/${editingCourt.id}`, formData);
                toast.success("Court updated");
            } else {
                await api.post("/courts", formData);
                toast.success("Court added");
            }
            setIsDialogOpen(false);
            setEditingCourt(null);
            setFormData({ courtName: "", courtType: "District Court", city: "", state: "", address: "", jurisdiction: "" });
            fetchCourts();
        } catch (error) {
            toast.error("Failed to save court");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/courts/${id}`);
            toast.success("Court deleted");
            fetchCourts();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleEdit = (court: Court) => {
        setEditingCourt(court);
        setFormData({
            courtName: court.courtName,
            courtType: court.courtType,
            city: court.city,
            state: court.state,
            address: court.address,
            jurisdiction: court.jurisdiction || ""
        });
        setIsDialogOpen(true);
    };

    const filteredCourts = courts.filter(c =>
        c.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-indigo-950">Court Directory</h2>
                    <p className="text-muted-foreground">Maintain a global directory of courts for legal drafting.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingCourt(null);
                        setFormData({ courtName: "", courtType: "District Court", city: "", state: "", address: "", jurisdiction: "" });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Court
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{editingCourt ? "Edit Court" : "Add New Court"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="name">Court Name</Label>
                                    <Input id="name" value={formData.courtName} onChange={e => setFormData({ ...formData, courtName: e.target.value })} required placeholder="e.g. Principal District Court" className="bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Court Type</Label>
                                    <select
                                        id="type"
                                        className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                        value={formData.courtType}
                                        onChange={e => setFormData({ ...formData, courtType: e.target.value })}
                                    >
                                        <option>District Court</option>
                                        <option>High Court</option>
                                        <option>Supreme Court</option>
                                        <option>Tribunal</option>
                                        <option>Magistrate Court</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jurisdiction">Jurisdiction</Label>
                                    <Input id="jurisdiction" value={formData.jurisdiction} onChange={e => setFormData({ ...formData, jurisdiction: e.target.value })} placeholder="e.g. Civil/Criminal" className="bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required className="bg-muted/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required className="bg-muted/30" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="address">Full Address</Label>
                                    <Input id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="bg-muted/30" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-10">
                                    {editingCourt ? "Update Court" : "Save Court"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={location.pathname} onValueChange={(v) => navigate(v)} className="w-full">
                <TabsList className="bg-muted/50 p-1 text-indigo-950">
                    <TabsTrigger value="/drafts" className="data-[state=active]:bg-white">My Drafts</TabsTrigger>
                    <TabsTrigger value="/drafts/types" className="data-[state=active]:bg-white">Draft Types</TabsTrigger>
                    <TabsTrigger value="/drafts/courts" className="data-[state=active]:bg-white">Courts</TabsTrigger>
                    <TabsTrigger value="/drafts/terminologies" className="data-[state=active]:bg-white">Dictionary</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground ml-3" />
                <Input
                    placeholder="Search courts by name or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm h-11 bg-card shadow-sm"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm border-collapse">
                            <thead className="bg-indigo-50/50">
                                <tr className="border-b transition-colors">
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900">Court Name</th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900">Type</th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900">Jurisdiction</th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900">Location</th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900 max-w-[200px]">Address</th>
                                    <th className="h-14 px-4 text-right font-semibold text-indigo-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredCourts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground h-48 bg-muted/5">
                                            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                            No courts found in your directory.
                                            <Button variant="link" className="text-indigo-600 font-bold block mt-2" onClick={() => setIsDialogOpen(true)}>
                                                Add First Court
                                            </Button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCourts.map((c) => (
                                        <tr key={c.id} className="transition-colors hover:bg-muted/30">
                                            <td className="p-4 align-middle font-bold text-slate-800">{c.courtName}</td>
                                            <td className="p-4 align-middle">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white text-indigo-600 border-indigo-100">
                                                    {c.courtType}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">{c.jurisdiction || "-"}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{c.city}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">{c.state}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle max-w-[200px] truncate text-muted-foreground" title={c.address}>
                                                {c.address || "-"}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-indigo-500 hover:bg-indigo-50" onClick={() => handleEdit(c)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-red-50" onClick={() => handleDelete(c.id)}>
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
            )}
        </div>
    );
}
