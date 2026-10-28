
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, CheckCircle, XCircle, HelpCircle, Link as LinkIcon, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Interfaces
interface CaseHistory {
    id: number;
    new_status: string;
    remarks: string;
    createdAt: string;
    changer: { username: string; role: string };
}

interface CaseDocument {
    id: number;
    file_name?: string;
    file_url?: string;
    link_url?: string;
    uploader?: { username: string };
    createdAt: string;
}

interface CaseIntake {
    id: number;
    client_name: string;
    client_phone: string;
    client_email: string;
    case_type: string;
    narration: string;
    audio_url?: string;
    is_new_case: boolean;
    noc_form_url?: string;
    noc_remarks?: string;
    status: string;
    createdAt: string;
    creator?: { username: string; role: string };
    reviewer?: { username: string; role: string };
    assignees?: { id: number; username: string; role: string }[];
    history: CaseHistory[];
    documents?: CaseDocument[];
    created_by: number;
}

export default function CaseDetail() {
    const { id } = useParams();
    const [data, setData] = useState<CaseIntake | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For updating narration if clarification requested
    const [editMode, setEditMode] = useState(false);
    const [updatedNarration, setUpdatedNarration] = useState("");

    // Fact Submission State
    const [newFactNarration, setNewFactNarration] = useState("");
    const [newFiles, setNewFiles] = useState<FileList | null>(null);
    const [newLinks, setNewLinks] = useState<string[]>([""]);

    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchCase = async () => {
        setLoading(true);
        try {
            const token = user?.token || localStorage.getItem('token');
            const response = await fetch(`/api/cases/${id}`, {
                headers: { "x-access-token": token || "" }
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
                setUpdatedNarration(result.narration);
            } else {
                console.error("Failed to fetch case details");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCase();
    }, [id, user]);

    const handleReviewAction = async (action: 'APPROVE' | 'REJECT' | 'CLARIFY') => {
        if (!reviewRemarks && action !== 'APPROVE') {
            alert("Please provide remarks for rejection or clarification.");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = user?.token || localStorage.getItem('token');
            const response = await fetch(`/api/cases/${id}/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token || ""
                },
                body: JSON.stringify({ action, remarks: reviewRemarks })
            });

            if (response.ok) {
                fetchCase(); // Refresh data
                setReviewRemarks("");
            } else {
                console.error("Review action failed");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateFacts = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("narration", newFactNarration);

            if (newFiles) {
                for (let i = 0; i < newFiles.length; i++) {
                    formData.append("files", newFiles[i]);
                }
            }

            formData.append("links", JSON.stringify(newLinks.filter(l => l.trim() !== "")));

            const token = user?.token || localStorage.getItem('token');
            const response = await fetch(`/api/cases/${id}/facts`, {
                method: "POST",
                headers: {
                    "x-access-token": token || ""
                },
                body: formData
            });

            if (response.ok) {
                setNewFactNarration("");
                setNewFiles(null);
                setNewLinks([""]);
                fetchCase();
            } else {
                console.error("Update failed");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addLinkField = () => setNewLinks([...newLinks, ""]);
    const updateLinkField = (index: number, val: string) => {
        const updated = [...newLinks];
        updated[index] = val;
        setNewLinks(updated);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!data) return <div className="p-8">Case not found.</div>;

    const isCreator = data.created_by === user?.id;
    const isAssignee = data.assignees?.some(a => a.id === user?.id);
    const isAdmin = user?.role === "Admin" || user?.role === "admin" || user?.username === 'admin';
    const canManageFacts = isCreator || isAssignee || isAdmin;

    const canReview = (user?.role === "Senior Advocate" || isAdmin) && data.status === "Narration Submitted";
    const canEdit = data.status === "Clarification Requested" && (isCreator || isAdmin);

    return (
        <div className="w-full p-6 space-y-6">
            <Button variant="ghost" onClick={() => navigate("/litigation")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Cases
            </Button>

            {/* Header & Status */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{data.client_name}</h1>
                    <p className="text-muted-foreground">{data.case_type} • {data.is_new_case ? "New Case" : "NOC Case"}</p>
                </div>
                <div className="flex items-center gap-3">
                    {data.status === 'Approved by Senior' && (
                        <Button onClick={() => navigate(`/drafts/new?caseId=${data.id}`)} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                            <FileText className="mr-2 h-4 w-4" /> Create Draft
                        </Button>
                    )}
                    <Badge className={`text-lg px-4 py-1 ${data.status === 'Approved by Senior' ? 'bg-green-600' : data.status === 'Rejected' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {data.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* NOC Details (Show only if applicable) */}
                    {!data.is_new_case && (
                        <Card>
                            <CardHeader>
                                <CardTitle>NOC Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 border rounded-md bg-blue-50/50 space-y-3">
                                    {data.noc_form_url && (
                                        <div>
                                            <span className="text-xs text-muted-foreground block">NOC Form</span>
                                            <a href={data.noc_form_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-2">
                                                View Attached NOC Form
                                            </a>
                                        </div>
                                    )}
                                    {data.noc_remarks && (
                                        <div>
                                            <span className="text-xs text-muted-foreground block">NOC Remarks</span>
                                            <p className="text-sm">{data.noc_remarks}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Meta Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground">Client Phone</label>
                                <div className="font-medium">{data.client_phone || "N/A"}</div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Client Email</label>
                                <div className="font-medium">{data.client_email || "N/A"}</div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Assigned To</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {data.assignees && data.assignees.length > 0 ? (
                                        data.assignees.map(a => (
                                            <Badge key={a.id} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {a.username}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Created By</label>
                                <div className="font-medium">{data.creator?.username}</div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">Date Created</label>
                                <div className="font-medium">{new Date(data.createdAt).toLocaleDateString()}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Facts & Documents Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle>Facts of the Case & Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Display Current Narration */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Current Narration/Facts</label>
                                <div className="p-4 bg-muted/30 rounded-md whitespace-pre-wrap text-sm border">
                                    {data.narration || "No facts provided yet."}
                                </div>
                            </div>

                            {/* Display Documents & Links */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Related Documents & Links</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {data.documents && data.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-white hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-full">
                                                    {doc.file_url ? <CheckCircle className="h-4 w-4 text-blue-600" /> : <LinkIcon className="h-4 w-4 text-blue-600" />}
                                                </div>
                                                <div>
                                                    {doc.file_url ? (
                                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                                                            {doc.file_name}
                                                        </a>
                                                    ) : (
                                                        <a href={doc.link_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                                                            {doc.link_url}
                                                        </a>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Added by {doc.uploader?.username} • {new Date(doc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!data.documents || data.documents.length === 0) && (
                                        <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-md">
                                            No documents or links attached.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Facts form for authorized users */}
                            {canManageFacts && (
                                <div className="pt-6 border-t space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Add More Facts & Documents</h4>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium uppercase">Updated Narration (Facts)</label>
                                        <Textarea
                                            placeholder="Add details about the facts of the case..."
                                            value={newFactNarration}
                                            onChange={(e) => setNewFactNarration(e.target.value)}
                                            className="min-h-[120px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase">Upload Documents</label>
                                            <Input
                                                type="file"
                                                multiple
                                                onChange={(e) => setNewFiles(e.target.files)}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-[10px] text-muted-foreground italic leading-none">Max 10MB each. PDF, Images, Word supported.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium uppercase">Related Links</label>
                                            <div className="space-y-2">
                                                {newLinks.map((link, idx) => (
                                                    <Input
                                                        key={idx}
                                                        placeholder="https://example.com"
                                                        value={link}
                                                        onChange={(e) => updateLinkField(idx, e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                ))}
                                                <Button variant="outline" size="sm" onClick={addLinkField} className="w-full text-xs h-8">
                                                    + Add Another Link
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleUpdateFacts}
                                        disabled={isSubmitting || (!newFactNarration && !newFiles && newLinks.every(l => !l))}
                                        className="w-full"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Save Facts & Documents"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Controls (Senior Review & History) */}
                <div className="space-y-6">
                    {/* Senior Review Panel */}
                    {(canReview || user?.role === 'admin' || user?.role === 'Admin') && ( // Allow admin to see for demo
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg">Senior Review</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Enter review remarks..."
                                    value={reviewRemarks}
                                    onChange={(e) => setReviewRemarks(e.target.value)}
                                />
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => handleReviewAction('APPROVE')}
                                        disabled={isSubmitting}
                                        className="bg-green-600 hover:bg-green-700 w-full"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve Case
                                    </Button>
                                    <Button
                                        onClick={() => handleReviewAction('CLARIFY')}
                                        disabled={isSubmitting}
                                        className="bg-yellow-600 hover:bg-yellow-700 w-full"
                                    >
                                        <HelpCircle className="mr-2 h-4 w-4" /> Request Clarification
                                    </Button>
                                    <Button
                                        onClick={() => handleReviewAction('REJECT')}
                                        disabled={isSubmitting}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" /> Reject Case
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* History Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.history && data.history.map((h) => (
                                <div key={h.id} className="border-l-2 pl-4 border-muted pb-4 last:pb-0">
                                    <div className="text-sm font-semibold">{h.new_status}</div>
                                    <div className="text-xs text-muted-foreground">
                                        by {h.changer?.username} • {new Date(h.createdAt).toLocaleDateString()}
                                    </div>
                                    {h.remarks && <div className="text-sm mt-1 bg-muted/50 p-2 rounded">{h.remarks}</div>}
                                </div>
                            ))}
                            {data.history.length === 0 && <span className="text-sm text-muted-foreground">No history.</span>}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
