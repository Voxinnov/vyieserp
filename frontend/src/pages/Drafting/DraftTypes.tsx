
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Trash2, Edit, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
    id: number;
    name: string;
}

interface DraftType {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    categories?: Category[];
}

export default function DraftTypes() {
    const [draftTypes, setDraftTypes] = useState<DraftType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<DraftType | null>(null);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: "",
        draft_type_id: 0
    });

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchDraftTypes();
    }, []);

    const fetchDraftTypes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/drafts/types");
            setDraftTypes(response.data);
        } catch (error) {
            toast.error("Failed to load draft types");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await api.put(`/draft-types/${editingType.id}`, formData);
                toast.success("Draft Type updated");
            } else {
                await api.post("/draft-types", formData);
                toast.success("Draft Type added");
            }
            setIsDialogOpen(false);
            setEditingType(null);
            setFormData({ name: "", description: "" });
            fetchDraftTypes();
        } catch (error) {
            toast.error("Failed to save draft type");
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/draft-categories", categoryFormData);
            toast.success("Category added");
            setIsCategoryDialogOpen(false);
            setCategoryFormData({ name: "", draft_type_id: 0 });
            fetchDraftTypes();
        } catch (error) {
            toast.error("Failed to add category");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure? This may affect existing drafts of this type.")) return;
        try {
            await api.delete(`/draft-types/${id}`);
            toast.success("Draft Type deleted");
            fetchDraftTypes();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await api.delete(`/draft-categories/${id}`);
            toast.success("Category deleted");
            fetchDraftTypes();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleEdit = (type: DraftType) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            description: type.description || ""
        });
        setIsDialogOpen(true);
    };

    const toggleRow = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const filteredTypes = draftTypes.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-indigo-950">Draft Management</h2>
                    <p className="text-muted-foreground">Manage types and categories of legal documents.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingType(null);
                        setFormData({ name: "", description: "" });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Draft Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">{editingType ? "Edit Draft Type" : "Add New Draft Type"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Type Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-muted/50"
                                    placeholder="e.g. Vakkalath, Notice, Petition"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of usage..."
                                    rows={4}
                                    className="bg-muted/50"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-10">
                                    {editingType ? "Update Type" : "Save Type"}
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
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm h-11 bg-card shadow-sm border-muted"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-muted-foreground animate-pulse">Loading draft patterns...</p>
                </div>
            ) : (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm border-collapse">
                            <thead className="bg-indigo-50/50">
                                <tr className="border-b transition-colors">
                                    <th className="h-14 px-4 font-medium text-left w-[48px]"></th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900 w-[100px]">ID</th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900">Name</th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900 hidden md:table-cell">Description</th>
                                    <th className="h-14 px-4 text-left font-semibold text-indigo-900">Created At</th>
                                    <th className="h-14 px-4 text-right font-semibold text-indigo-900 w-[140px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-muted-foreground h-48 bg-muted/5">
                                            <div className="flex flex-col items-center">
                                                <FileText className="h-12 w-12 text-muted-foreground/30 mb-2" />
                                                <p>No draft types found in your library.</p>
                                                <Button variant="link" className="text-indigo-600 mt-2" onClick={() => setIsDialogOpen(true)}>Start by adding one</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTypes.map((t) => (
                                        <React.Fragment key={t.id}>
                                            <tr className={cn(
                                                "transition-colors hover:bg-muted/30 group",
                                                expandedRows.includes(t.id) && "bg-muted/20"
                                            )}>
                                                <td className="p-4 align-middle">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => toggleRow(t.id)}
                                                    >
                                                        {expandedRows.includes(t.id) ? (
                                                            <ChevronDown className="h-4 w-4 text-indigo-600" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </td>
                                                <td className="p-4 align-middle font-mono text-xs text-muted-foreground">#{t.id}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-gray-800">{t.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground hidden md:table-cell max-w-[300px] truncate" title={t.description}>
                                                    {t.description || "No description provided"}
                                                </td>
                                                <td className="p-4 align-middle text-muted-foreground">
                                                    {new Date(t.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                                                            title="Add Category"
                                                            onClick={() => {
                                                                setCategoryFormData({ name: "", draft_type_id: t.id });
                                                                setIsCategoryDialogOpen(true);
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleEdit(t)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:bg-red-50"
                                                            onClick={() => handleDelete(t.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows.includes(t.id) && (
                                                <tr className="bg-indigo-50/10 active-row">
                                                    <td className="p-0"></td>
                                                    <td colSpan={5} className="p-4">
                                                        <div className="pl-4 border-l-2 border-indigo-200 py-2 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Categories Linked to {t.name}</h4>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {t.categories && t.categories.length > 0 ? (
                                                                    t.categories.map(cat => (
                                                                        <Badge
                                                                            key={cat.id}
                                                                            variant="secondary"
                                                                            className="px-3 py-1 group/badge flex items-center gap-1.5 bg-white border shadow-sm"
                                                                        >
                                                                            {cat.name}
                                                                            <button
                                                                                onClick={() => handleDeleteCategory(cat.id)}
                                                                                className="hover:text-red-600 text-muted-foreground transition-colors"
                                                                            >
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </button>
                                                                        </Badge>
                                                                    ))
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground italic">No categories defined for this type yet.</p>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-6 text-[10px] px-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                                                                    onClick={() => {
                                                                        setCategoryFormData({ name: "", draft_type_id: t.id });
                                                                        setIsCategoryDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" /> Add Category
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="catName">Category Name</Label>
                            <Input
                                id="catName"
                                value={categoryFormData.name}
                                onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                required
                                placeholder="e.g. Criminal, Civil, Corporate"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Add to {draftTypes.find(dt => dt.id === categoryFormData.draft_type_id)?.name}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
