
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard } from "lucide-react";
import { toast } from "sonner";

// Define interface for Case
interface CaseIntake {
    id: number;
    client_name: string;
    case_type: string;
    status: string;
    createdAt: string;
    creator?: { username: string };
    reviewer?: { username: string };
    assignees?: { id: number; username: string }[];
}

interface BillingData {
    vakalath_fee: string;
    sitting_fee: string;
    representation_fee: string;
    documentation_fee: string;
    payment_status: string;
    remarks: string;
}

export default function LitigationList() {
    const [cases, setCases] = useState<CaseIntake[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useAuth();
    const navigate = useNavigate();

    // Billing State
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState<CaseIntake | null>(null);
    const [billingData, setBillingData] = useState<BillingData>({
        vakalath_fee: "0",
        sitting_fee: "0",
        representation_fee: "0",
        documentation_fee: "0",
        payment_status: "Pending",
        remarks: ""
    });
    const [isSavingBilling, setIsSavingBilling] = useState(false);

    const canManageBilling = user?.role === "Senior Advocate" || user?.role === "Admin" || user?.role === "admin" || user?.username === 'admin';

    // Fetch cases
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await api.get("/cases");
                setCases(response.data);
            } catch (error) {
                console.error("Error fetching cases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    const fetchBilling = async (caseId: number) => {
        try {
            const response = await api.get(`/billing/case/${caseId}`);
            if (response.data) {
                setBillingData({
                    vakalath_fee: response.data.vakalath_fee.toString(),
                    sitting_fee: response.data.sitting_fee.toString(),
                    representation_fee: response.data.representation_fee.toString(),
                    documentation_fee: response.data.documentation_fee.toString(),
                    payment_status: response.data.payment_status || "Pending",
                    remarks: response.data.remarks || ""
                });
            }
        } catch (error) {
            console.error("Error fetching billing:", error);
        }
    };

    const handleOpenBilling = (e: React.MouseEvent, c: CaseIntake) => {
        e.stopPropagation();
        setSelectedCase(c);
        fetchBilling(c.id);
        setIsBillingOpen(true);
    };

    const handleSaveBilling = async () => {
        if (!selectedCase) return;
        setIsSavingBilling(true);
        try {
            await api.post("/billing/case", {
                case_id: selectedCase.id,
                ...billingData
            });
            toast.success("Billing information saved successfully.");
            setIsBillingOpen(false);
        } catch (error) {
            console.error("Error saving billing:", error);
            toast.error("Failed to save billing information.");
        } finally {
            setIsSavingBilling(false);
        }
    };

    const filteredCases = cases.filter(c =>
        c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.case_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved by Senior": return "bg-green-500 hover:bg-green-600";
            case "Rejected": return "bg-red-500 hover:bg-red-600";
            case "Clarification Requested": return "bg-yellow-500 hover:bg-yellow-600";
            default: return "bg-blue-500 hover:bg-blue-600";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Litigation</h2>
                    <p className="text-muted-foreground">Manage case intakes and reviews.</p>
                </div>
                {/* Only Junior Advocates (or Admins/Seniors if desired, but user said Junior creates) can create */}
                {/* Assuming all can see the button but backend restricts if strictly role based. 
                    User Requirement: "Junior Advocate can create a new Case Intake record." 
                    We'll show it for everyone for now, or check role. */}
                {(user?.role === "Junior Advocate" || user?.role?.toLowerCase().includes("admin")) && (
                    <Button onClick={() => navigate("/litigation/new")}>
                        <Plus className="mr-2 h-4 w-4" /> New Case
                    </Button>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCases.length === 0 ? (
                        <div className="col-span-full text-center text-muted-foreground py-8">
                            No cases found.
                        </div>
                    ) : (
                        filteredCases.map((c) => (
                            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/litigation/${c.id}`)}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {c.case_type}
                                    </CardTitle>
                                    <Badge className={getStatusColor(c.status)}>
                                        {c.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{c.client_name}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created: {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                    {c.creator && (
                                        <p className="text-xs text-muted-foreground">
                                            By: {c.creator.username}
                                        </p>
                                    )}
                                    {c.assignees && c.assignees.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {c.assignees.slice(0, 2).map((a, idx) => (
                                                <Badge key={idx} variant="outline" className="text-[10px] py-0 h-4 border-blue-200 text-blue-600 bg-blue-50">
                                                    {a.username}
                                                </Badge>
                                            ))}
                                            {c.assignees.length > 2 && (
                                                <Badge variant="outline" className="text-[10px] py-0 h-4">
                                                    +{c.assignees.length - 2} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {canManageBilling && (
                                        <div className="mt-4 pt-4 border-t flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                onClick={(e) => handleOpenBilling(e, c)}
                                            >
                                                <DollarSign className="h-4 w-4" /> Billing & Finance
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Billing Dialog */}
            <Dialog open={isBillingOpen} onOpenChange={setIsBillingOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-indigo-600" />
                            Billing - {selectedCase?.client_name}
                        </DialogTitle>
                        <DialogDescription>
                            Manage fees for {selectedCase?.case_type} litigation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vakalath">Vakalath Fees</Label>
                                <Input
                                    id="vakalath"
                                    type="number"
                                    value={billingData.vakalath_fee}
                                    onChange={(e) => setBillingData({ ...billingData, vakalath_fee: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sitting">Sitting Fees</Label>
                                <Input
                                    id="sitting"
                                    type="number"
                                    value={billingData.sitting_fee}
                                    onChange={(e) => setBillingData({ ...billingData, sitting_fee: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="representation">Representation Fees</Label>
                                <Input
                                    id="representation"
                                    type="number"
                                    value={billingData.representation_fee}
                                    onChange={(e) => setBillingData({ ...billingData, representation_fee: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="documentation">Documentation Fees</Label>
                                <Input
                                    id="documentation"
                                    type="number"
                                    value={billingData.documentation_fee}
                                    onChange={(e) => setBillingData({ ...billingData, documentation_fee: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Payment Status</Label>
                            <Select
                                value={billingData.payment_status}
                                onValueChange={(val) => setBillingData({ ...billingData, payment_status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                placeholder="Any additional notes..."
                                value={billingData.remarks}
                                onChange={(e) => setBillingData({ ...billingData, remarks: e.target.value })}
                            />
                        </div>

                        <div className="p-3 bg-muted rounded-md flex justify-between items-center">
                            <span className="font-semibold text-sm">Total Amount:</span>
                            <span className="text-lg font-bold text-indigo-700 font-mono">
                                ₹{(parseFloat(billingData.vakalath_fee || "0") +
                                    parseFloat(billingData.sitting_fee || "0") +
                                    parseFloat(billingData.representation_fee || "0") +
                                    parseFloat(billingData.documentation_fee || "0")).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBillingOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveBilling} disabled={isSavingBilling}>
                            {isSavingBilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Billing"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
