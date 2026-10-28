import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    tax_id: string;
    status: string;
}

export default function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get("/clients");
            setClients(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching clients:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this client?")) {
            try {
                await api.delete(`/clients/${id}`);
                setClients(clients.filter((c) => c.id !== id));
            } catch (error) {
                console.error("Error deleting client:", error);
            }
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">Manage your client database.</p>
                </div>
                {/* 
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
                */}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-8">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No clients found.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-lg">{client.name}</div>
                                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                    {client.status}
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {client.email || "N/A"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {client.phone || "N/A"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {client.address || "N/A"}
                                </div>
                                {client.tax_id && (
                                    <div className="pt-2 border-t mt-2">
                                        <span className="font-medium">Tax ID:</span> {client.tax_id}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 gap-2">
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(client.id)}>
                                    <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
