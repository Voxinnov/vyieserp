import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";

interface TaskFormData {
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
}

interface TaskFormProps {
    initialData?: TaskFormData;
    onSubmit: (data: TaskFormData) => Promise<void>;
    isSubmitting?: boolean;
    title: string;
}

export default function TaskForm({ initialData, onSubmit, isSubmitting = false, title }: TaskFormProps) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<TaskFormData>({
        client_id: 1,
        case_number: "",
        court: "",
        cnr_number: "",
        last_hearing_date: "",
        next_hearing_date: "",
        advocates: "",
        tags: "",
        doc_collection_request: false,
        description: "",
        doc_collection_message: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/tasks")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 border rounded-lg p-6 bg-card shadow-sm">
                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Case Number <span className="text-destructive">*</span></label>
                    <Input
                        required
                        value={formData.case_number}
                        onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                        placeholder="e.g. WP/1234/2024"
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Court <span className="text-destructive">*</span></label>
                    <Input
                        required
                        value={formData.court}
                        onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                        placeholder="e.g. High Court of Delhi"
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">CNR Number</label>
                    <Input
                        value={formData.cnr_number}
                        onChange={(e) => setFormData({ ...formData, cnr_number: e.target.value })}
                        placeholder="e.g. DLHC0100..."
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Advocates</label>
                    <Input
                        value={formData.advocates}
                        onChange={(e) => setFormData({ ...formData, advocates: e.target.value })}
                        placeholder="e.g. John Doe, Jane Smith"
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Last Hearing Date</label>
                    <Input
                        type="date"
                        value={formData.last_hearing_date}
                        onChange={(e) => setFormData({ ...formData, last_hearing_date: e.target.value })}
                    />
                </div>

                <div className="col-span-2 md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Next Hearing Date</label>
                    <Input
                        type="date"
                        value={formData.next_hearing_date}
                        onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
                    />
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <Input
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="e.g. Urgent, Civil, Injunction"
                    />
                </div>

                <div className="col-span-2 space-y-4 border rounded-md p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <label htmlFor="docRequest" className="text-sm font-medium cursor-pointer">
                            Create Document Collection Request
                        </label>
                        <Switch
                            id="docRequest"
                            checked={formData.doc_collection_request}
                            onCheckedChange={(checked) => setFormData({ ...formData, doc_collection_request: checked })}
                        />
                    </div>

                    {formData.doc_collection_request && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-medium">
                                Message for Client <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.doc_collection_message || ""}
                                onChange={(e) => setFormData({ ...formData, doc_collection_message: e.target.value })}
                                placeholder="Please upload the required documents..."
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter detailed task description..."
                    />
                </div>

                <div className="col-span-2 flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/tasks")}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Task"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
