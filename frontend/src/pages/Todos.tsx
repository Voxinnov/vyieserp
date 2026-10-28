import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Todo {
    id: number;
    what_to_do: string;
    case_number: string;
    details: string;
    due_date: string;
    is_repeat: boolean;
    repeat_interval: string;
    assigned_to: number;
    assignee?: {
        username: string;
        email: string;
    };
    createdAt?: string;
}

export default function Todos() {
    const navigate = useNavigate();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await api.get("/todos");
            setTodos(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching todos:", error);
            setLoading(false);
        }
    };

    const handleCreate = () => {
        navigate("/todos/create");
    };

    const handleEdit = (id: number) => {
        navigate(`/todos/edit/${id}`);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this to-do?")) {
            try {
                await api.delete(`/todos/${id}`);
                setTodos(todos.filter((t) => t.id !== id));
            } catch (error) {
                console.error("Error deleting todo:", error);
            }
        }
    };

    const filteredTodos = todos.filter(todo =>
        todo.what_to_do.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.case_number && todo.case_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">To-Do List</h1>
                    <p className="text-muted-foreground">Manage your tasks and reminders.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create To-Do
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Title, Case No..."
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
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">What to Do</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Case No.</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Due Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Repeat</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assigned To</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">Loading todos...</td>
                                </tr>
                            ) : filteredTodos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center">No to-dos found. Create one to get started.</td>
                                </tr>
                            ) : (
                                filteredTodos.map((todo) => (
                                    <tr key={todo.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{todo.what_to_do}</td>
                                        <td className="p-4 align-middle">{todo.case_number || "-"}</td>
                                        <td className="p-4 align-middle">{todo.due_date || "-"}</td>
                                        <td className="p-4 align-middle">
                                            {todo.is_repeat ? (
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 capitalize">
                                                    {todo.repeat_interval}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">No</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {todo.assignee ? todo.assignee.username : <span className="text-muted-foreground">Unassigned</span>}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(todo.id)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(todo.id)}>
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
