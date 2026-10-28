
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, FileText, Trash2, Eye, FileDigit, Building2, BookOpen, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Draft {
    id: number;
    party1Label: string;
    party2Label: string;
    createdAt: string;
    type?: { name: string };
    category?: { name: string };
    creator?: { username: string };
}

export default function Drafts() {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isAdmin = user?.role === "admin" || user?.role === "super_admin" || user?.role === "Admin";

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        try {
            setLoading(true);
            const response = await api.get("/drafts");
            setDrafts(response.data);
        } catch (error) {
            console.error("Error fetching drafts:", error);
            toast.error("Failed to load drafts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this draft?")) return;
        try {
            await api.delete(`/drafts/${id}`);
            toast.success("Draft deleted");
            fetchDrafts();
        } catch (error) {
            toast.error("Failed to delete draft");
        }
    };

    const handleSeed = async () => {
        try {
            const res = await api.post("/drafts/seed");
            toast.success(res.data.message || "Draft types seeded successfully");
            fetchDrafts();
        } catch (e) {
            toast.error("Seeding failed");
        }
    };

    const filteredDrafts = drafts.filter(d =>
        (d.type?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.party1Label || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.party2Label || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-indigo-950">Legal Drafting</h2>
                    <p className="text-muted-foreground">Manage and generate legal documents, vakalaths, and petitions.</p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={handleSeed}>
                            <Database className="mr-2 h-4 w-4" /> Seed Data
                        </Button>
                    )}
                    <Button onClick={() => navigate("/drafts/new")} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> New Draft
                    </Button>
                </div>
            </div>

            <Tabs value={location.pathname} onValueChange={(v) => navigate(v)} className="w-full">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="/drafts" className="data-[state=active]:bg-white">My Drafts</TabsTrigger>
                    <TabsTrigger value="/drafts/types" className="data-[state=active]:bg-white">Draft Types</TabsTrigger>
                    <TabsTrigger value="/drafts/courts" className="data-[state=active]:bg-white">Courts</TabsTrigger>
                    <TabsTrigger value="/drafts/terminologies" className="data-[state=active]:bg-white">Dictionary</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search drafts by type or party..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDrafts.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground py-16 border-2 border-dashed rounded-xl bg-muted/5">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No drafts found.</p>
                            <p className="text-sm mb-6">Click "New Draft" to start your first legal document.</p>
                            <Button variant="outline" onClick={() => navigate("/drafts/new")}>
                                <Plus className="mr-2 h-4 w-4" /> Create First Draft
                            </Button>
                        </div>
                    ) : (
                        filteredDrafts.map((d) => (
                            <Card key={d.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500 overflow-hidden group">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                                        {d.type?.name}
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-100">
                                        {d.category?.name || "General"}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                                            {d.party1Label || "Party 1"} <span className="text-muted-foreground font-normal px-1">vs</span> {d.party2Label || "Party 2"}
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                            <FileText className="h-3 w-3" />
                                            Created: {new Date(d.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        {d.creator && (
                                            <div className="text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-tighter">
                                                Author: {d.creator.username}
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                                            <Button variant="ghost" size="sm" className="h-9 px-2 flex-1 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => navigate(`/drafts/${d.id}`)}>
                                                <Eye className="h-4 w-4 mr-2" /> View
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-9 px-2 text-indigo-600 flex-1 hover:bg-indigo-50">
                                                <FileDigit className="h-4 w-4 mr-2" /> Sign
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-9 px-2 text-destructive hover:bg-red-50" onClick={() => handleDelete(d.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
