
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Trash2, Edit, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Term {
    id: number;
    name: string;
    type: string;
    status: boolean;
}

const TERM_TYPES = [
    { value: 'legal-abbreviation', label: 'Legal Abbreviation' },
    { value: 'parties-terminology', label: 'Parties Terminology' },
    { value: 'legal-terminology', label: 'Legal Terminology' },
    { value: 'administrative-terminology', label: 'Administrative Terminology' }
];

export default function Terminologies() {
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<Term | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        type: "legal-terminology",
        status: true
    });

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        try {
            setLoading(true);
            const response = await api.get("/terms");
            setTerms(response.data);
        } catch (error) {
            toast.error("Failed to load terminologies");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTerm) {
                await api.put(`/terms/${editingTerm.id}`, formData);
                toast.success("Terminology updated");
            } else {
                await api.post("/terms", formData);
                toast.success("Terminology added");
            }
            setIsDialogOpen(false);
            setEditingTerm(null);
            setFormData({ name: "", type: "legal-terminology", status: true });
            fetchTerms();
        } catch (error) {
            toast.error("Failed to save terminology");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/terms/${id}`);
            toast.success("Terminology deleted");
            fetchTerms();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleToggleStatus = async (term: Term) => {
        try {
            await api.put(`/terms/${term.id}`, { status: !term.status });
            fetchTerms();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const filteredTerms = terms.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-indigo-950">Legal Dictionary</h2>
                    <p className="text-muted-foreground">Manage legal abbreviations, parties terminology, and phrases.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Term
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{editingTerm ? "Edit Terminology" : "Add New Terminology"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Terminology/Phrase</Label>
                                <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Category Type</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {TERM_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-10">
                                    {editingTerm ? "Update Term" : "Save Term"}
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
                    placeholder="Search dictionary..."
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {filteredTerms.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground py-16 border-2 border-dashed rounded-xl bg-muted/5">
                            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20 text-indigo-600" />
                            <p className="font-medium text-lg">Dictionary is empty.</p>
                            <p className="text-sm">Add legal terms to get started.</p>
                            <Button variant="link" className="text-indigo-600 font-bold mt-2" onClick={() => setIsDialogOpen(true)}>
                                Add First Term
                            </Button>
                        </div>
                    ) : (
                        filteredTerms.map((t) => (
                            <Card key={t.id} className="hover:shadow-lg transition-all duration-200 group relative overflow-hidden border-indigo-50">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white text-indigo-600 border-indigo-100">
                                            {TERM_TYPES.find(v => v.value === t.type)?.label}
                                        </Badge>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => {
                                                setEditingTerm(t);
                                                setFormData({ name: t.name, type: t.type, status: t.status });
                                                setIsDialogOpen(true);
                                            }}>
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-md font-bold mt-3 text-slate-800 line-clamp-2">{t.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center pt-2 mt-auto">
                                    <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleToggleStatus(t)}>
                                        {t.status ? (
                                            <>
                                                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                                <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-tighter">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-2 w-2 rounded-full bg-slate-300" />
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Inactive</span>
                                            </>
                                        )}
                                    </div>
                                    <BookOpen className="h-5 w-5 text-indigo-100/50 group-hover:text-indigo-200 transition-colors" />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
