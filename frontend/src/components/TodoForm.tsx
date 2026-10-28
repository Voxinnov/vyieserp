import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";

interface TodoFormData {
    what_to_do: string;
    case_number: string;
    details: string;
    due_date: string;
    is_repeat: boolean;
    repeat_interval: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
    assigned_to: string;
}

interface TodoFormProps {
    initialData?: TodoFormData;
    onSubmit: (data: TodoFormData) => Promise<void>;
    isSubmitting?: boolean;
    title: string;
}

interface User {
    id: number;
    username: string;
    email: string;
}

export default function TodoForm({ initialData, onSubmit, isSubmitting = false, title }: TodoFormProps) {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState<TodoFormData>({
        what_to_do: "",
        case_number: "",
        details: "",
        due_date: "",
        is_repeat: false,
        repeat_interval: "none",
        assigned_to: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
        fetchUsers();
    }, [initialData]);

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/todos")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 border rounded-lg p-6 bg-card shadow-sm">
                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">What to do <span className="text-destructive">*</span></label>
                    <Input
                        required
                        value={formData.what_to_do}
                        onChange={(e) => setFormData({ ...formData, what_to_do: e.target.value })}
                        placeholder="e.g. File Affidavit"
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Case Number</label>
                    <Input
                        value={formData.case_number}
                        onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                        placeholder="e.g. WP/1234/2024"
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Assign To</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.assigned_to}
                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2 space-y-4 border rounded-md p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <label htmlFor="isRepeat" className="text-sm font-medium cursor-pointer">
                            Repeat Task?
                        </label>
                        <Switch
                            id="isRepeat"
                            checked={formData.is_repeat}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_repeat: checked })}
                        />
                    </div>

                    {formData.is_repeat && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-medium">
                                Repeat Interval
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.repeat_interval}
                                onChange={(e) => setFormData({ ...formData, repeat_interval: e.target.value as any })}
                            >
                                <option value="daily">Every Day</option>
                                <option value="weekly">Every Week</option>
                                <option value="monthly">Every Month</option>
                                <option value="yearly">Every Year</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Details</label>
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        placeholder="Enter detailed instructions..."
                    />
                </div>

                <div className="col-span-2 flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/todos")}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save To-Do"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
