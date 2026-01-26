import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Task {
    id: number;
    client_id: number;
    case_number: string;
    court: string;
    cnr_number: string;
    last_hearing_date: string;
    next_hearing_date: string;
    advocates: string;
    tags: string;
    doc_collection_request: boolean;
    doc_collection_message?: string;
    description: string;
    client?: {
        name: string;
    };
    createdAt?: string;
}

export default function Tasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get("/tasks");
            setTasks(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setLoading(false);
        }
    };

    const handleCreate = () => {
        navigate("/tasks/create");
    };

    const handleEdit = (id: number) => {
        navigate(`/tasks/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${id}`);
                setTasks(tasks.filter((t) => t.id !== id));
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const filteredTasks = tasks.filter(task =>
        task.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.court?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks Management</h1>
                    <p className="text-muted-foreground">Manage your legal tasks and court hearings.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Task
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Case Number, Court..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Case No.</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Court</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Next Hearing</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Advocates</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tags</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">Loading tasks...</td>
                                </tr>
                            ) : filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">No tasks found. Create one to get started.</td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{task.case_number}</td>
                                        <td className="p-4 align-middle">{task.court}</td>
                                        <td className="p-4 align-middle">{task.next_hearing_date}</td>
                                        <td className="p-4 align-middle">{task.advocates}</td>
                                        <td className="p-4 align-middle">
                                            {task.tags && <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">{task.tags}</span>}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(task.id)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(task.id)}>
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
        </div>
    );
}
