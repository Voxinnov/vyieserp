import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { ArrowLeft, Loader2, Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// FormData Interface
interface CaseFormData {
    client_name: string;
    client_phone: string;
    client_email: string;
    case_type: string;
    is_new_case: string;
    noc_file: FileList;
    noc_remarks: string;
    assigned_to: string[]; // Changed to array
}

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface User {
    id: number;
    username: string;
    role: string;
}

export default function NewCase() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CaseFormData>({
        defaultValues: {
            is_new_case: 'true',
            assigned_to: []
        }
    });

    const isNewCase = watch("is_new_case");
    const selectedAssignees = watch("assigned_to") || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, usersRes] = await Promise.all([
                    api.get("/clients"),
                    api.get("/users")
                ]);
                setClients(clientsRes.data);
                setUsers(usersRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleClientChange = (clientName: string) => {
        setValue("client_name", clientName);
        const selectedClient = clients.find(c => c.name === clientName);
        if (selectedClient) {
            setValue("client_phone", selectedClient.phone || "");
            setValue("client_email", selectedClient.email || "");
        }
    };

    const toggleAssignee = (userId: string) => {
        const current = [...selectedAssignees];
        const index = current.indexOf(userId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(userId);
        }
        setValue("assigned_to", current);
    };

    const onSubmit = async (data: CaseFormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("client_name", data.client_name);
            formData.append("client_phone", data.client_phone || "");
            formData.append("client_email", data.client_email || "");
            formData.append("case_type", data.case_type);
            formData.append("is_new_case", data.is_new_case);
            formData.append("noc_remarks", data.noc_remarks || "");

            // Append each user ID for multi-select
            data.assigned_to.forEach(id => {
                formData.append("assigned_to", id);
            });

            formData.append("narration", "No narration provided.");

            if (data.noc_file && data.noc_file[0]) {
                formData.append("noc_file", data.noc_file[0]);
            }

            const response = await api.post("/cases", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate("/litigation");
        } catch (error: any) {
            console.error("Error submitting case:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full p-6 space-y-6">
            <Button variant="ghost" onClick={() => navigate("/litigation")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Cases
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>New Case Intake</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client Name</label>
                                {loadingData ? (
                                    <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
                                ) : (
                                    <Select onValueChange={handleClientChange} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(client => (
                                                <SelectItem key={client.id} value={client.name}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Case Type</label>
                                <Select onValueChange={(val) => setValue("case_type", val)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Civil">Civil</SelectItem>
                                        <SelectItem value="Criminal">Criminal</SelectItem>
                                        <SelectItem value="Corporate">Corporate</SelectItem>
                                        <SelectItem value="Family">Family</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input {...register("client_phone")} placeholder="Phone Number" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input {...register("client_email")} placeholder="Email Address" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New or NOC Case?</label>
                                <Select onValueChange={(val) => setValue("is_new_case", val)} defaultValue="true">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">New Case</SelectItem>
                                        <SelectItem value="false">NOC Case</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assign To (Multi-select)</label>
                                {loadingData ? (
                                    <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal bg-background border-input">
                                                <span className="truncate">
                                                    {selectedAssignees.length === 0
                                                        ? "Select users..."
                                                        : `${selectedAssignees.length} selected`}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                                            <DropdownMenuLabel>Team Members</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {users.map((u) => (
                                                <DropdownMenuCheckboxItem
                                                    key={u.id}
                                                    checked={selectedAssignees.includes(u.id.toString())}
                                                    onCheckedChange={() => toggleAssignee(u.id.toString())}
                                                >
                                                    {u.username} <span className="text-xs text-muted-foreground ml-2">({u.role})</span>
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                {selectedAssignees.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedAssignees.map(id => {
                                            const u = users.find(user => user.id.toString() === id);
                                            return u ? (
                                                <Badge key={id} variant="secondary" className="gap-1 px-2 py-1">
                                                    {u.username}
                                                    <X
                                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                        onClick={() => toggleAssignee(id)}
                                                    />
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* NOC Conditional Fields */}
                        {isNewCase === 'false' && (
                            <div className="p-4 bg-muted/30 rounded-lg space-y-4 border border-dashed border-primary/20">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Upload NOC forms</label>
                                    <Input
                                        type="file"
                                        {...register("noc_file")}
                                        className="bg-background cursor-pointer"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    <p className="text-xs text-muted-foreground italic">Supported: PDF, Word, Images (Max 10MB)</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">NOC Remarks</label>
                                    <Textarea
                                        {...register("noc_remarks")}
                                        placeholder="Additional remarks for NOC..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="justify-end space-x-2">
                        <Button variant="outline" type="button" onClick={() => navigate("/litigation")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Intake
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
