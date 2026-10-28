
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Sparkles, X, Gavel, UserPlus, Home } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PetitionForm({ draftType, initialParties, onCancel }: { draftType: any, initialParties: any, onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    const [courts, setCourts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [availableClients, setAvailableClients] = useState<any[]>([]);
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        draftCategoryId: draftType.selectedCategory?.id || draftType.categories?.[0]?.id || "",
        petitionType: "BAIL PETITION",
        clientParty: initialParties?.party1Label || "Petitioner",
        party1Label: initialParties?.party1Label || "Petitioner",
        party2Label: initialParties?.party2Label || "Respondent",
        caseNumberDetails: [{ caseType: "CrlMP", caseNo: "", caseNoOf: new Date().getFullYear().toString(), location: "" }],
        courtId: "",
        advocateIds: [] as string[],
        clientIds: [] as string[],
        accusedDetails: [{ name: "", age: "", occupation: "", address: "" }],
        relevantActsAndSections: [{ actName: "", sections: [""] }],
        keyPoints: ["", ""],
        fee: "0"
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [courtsRes, usersRes, clientsRes] = await Promise.all([
                api.get("/courts"),
                api.get("/users"),
                api.get("/clients")
            ]);
            setCourts(courtsRes.data);
            setUsers(usersRes.data);
            setAvailableClients(clientsRes.data || []);
        } catch (error) {
            console.error("Failed to load metadata", error);
        }
    };

    const addListItem = (field: string, defaultValue: any) => {
        setFormData({ ...formData, [field]: [...(formData as any)[field], defaultValue] });
    };

    const removeListItem = (field: string, index: number) => {
        const list = [...(formData as any)[field]];
        list.splice(index, 1);
        setFormData({ ...formData, [field]: list });
    };

    const updateNestedItem = (field: string, index: number, subField: string, value: any) => {
        const list = [...(formData as any)[field]];
        list[index] = { ...list[index], [subField]: value };
        setFormData({ ...formData, [field]: list });
    };

    const validateForm = () => {
        const oppositePartyLabel = formData.clientParty === formData.party1Label ? formData.party2Label : formData.party1Label;

        if (!formData.courtId) {
            toast.error("Court is required");
            return false;
        }
        if (formData.clientIds.length === 0) {
            toast.error(`Please select at least one ${formData.clientParty}`);
            return false;
        }
        if (formData.advocateIds.length === 0) {
            toast.error("At least one advocate must be selected");
            return false;
        }
        if (formData.accusedDetails.some(a => !a.name)) {
            toast.error(`Name for ${oppositePartyLabel} is required`);
            return false;
        }
        if (formData.caseNumberDetails.some(c => !c.caseType || !c.caseNo)) {
            toast.error("Case type and number are required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                ...formData,
                draftTypeId: draftType.id,
                clientIds: formData.clientIds.map(Number),
                advocateIds: formData.advocateIds.map(Number),
                courtId: Number(formData.courtId),
                primaryAdvocateId: formData.advocateIds[0] ? Number(formData.advocateIds[0]) : undefined,
                fee: Number(formData.fee),
                keyPoints: formData.keyPoints.filter(p => p.trim() !== ""),
                relevantActsAndSections: formData.relevantActsAndSections.filter(a => a.actName.trim() !== "")
            };
            const response = await api.post("/drafts", payload);
            toast.success("Petition created successfully");
            navigate(`/drafts/${response.data.id}`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create petition");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20 text-black">
            {/* Header Area */}
            <div className="flex justify-between items-center border-b border-black pb-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-black" />
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Petition Form (AI Assisted)</h2>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white transition-all rounded-none font-bold px-6"
                    onClick={onCancel}
                >
                    BACK TO SELECTION
                </Button>
            </div>

            {/* Client Selection */}
            <Section title="Client Selection">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest px-1">Client Party *</Label>
                        <Select value={formData.clientParty} onValueChange={(v) => setFormData({ ...formData, clientParty: v })}>
                            <SelectTrigger className="h-12 border-slate-300 focus:ring-black rounded-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={formData.party1Label}>{formData.party1Label}</SelectItem>
                                <SelectItem value={formData.party2Label}>{formData.party2Label}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <Label className="text-xs font-black uppercase tracking-widest">Select Clients *</Label>
                            <Button type="button" variant="link" className="h-auto p-0 text-xs font-bold underline" onClick={() => navigate("/clients")}>
                                <UserPlus className="h-3 w-3 mr-1" /> CREATE NEW CLIENT
                            </Button>
                        </div>
                        <Select onValueChange={(v) => {
                            if (!formData.clientIds.includes(v)) {
                                setFormData({ ...formData, clientIds: [...formData.clientIds, v] });
                            }
                        }}>
                            <SelectTrigger className="h-12 border-slate-300 focus:ring-black rounded-none">
                                <SelectValue placeholder="Search & Select Clients" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableClients.map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.clientIds.map(id => {
                                const client = availableClients.find(c => String(c.id) === id);
                                return (
                                    <div key={id} className="flex items-center gap-2 bg-black text-white px-3 py-1 text-sm font-bold">
                                        {client?.name || id}
                                        <X className="h-3 w-3 cursor-pointer hover:text-slate-300" onClick={() => setFormData({ ...formData, clientIds: formData.clientIds.filter(cid => cid !== id) })} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Opposite Party Details */}
            <Section title={`${formData.clientParty === formData.party1Label ? formData.party2Label : formData.party1Label} Details`}>
                <div className="space-y-6">
                    {formData.accusedDetails.map((party, idx) => (
                        <div key={idx} className="relative p-6 border border-slate-200 bg-slate-50/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Party #{idx + 1}</span>
                                {idx > 0 && (
                                    <Button type="button" variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8" onClick={() => removeListItem('accusedDetails', idx)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Name *</Label>
                                    <Input
                                        value={party.name}
                                        onChange={(e) => updateNestedItem('accusedDetails', idx, 'name', e.target.value)}
                                        className="h-10 rounded-none border-slate-300 focus:ring-black"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Age</Label>
                                    <Input
                                        type="number"
                                        value={party.age}
                                        onChange={(e) => updateNestedItem('accusedDetails', idx, 'age', e.target.value)}
                                        className="h-10 rounded-none border-slate-300 focus:ring-black"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Occupation</Label>
                                    <Input
                                        value={party.occupation}
                                        onChange={(e) => updateNestedItem('accusedDetails', idx, 'occupation', e.target.value)}
                                        className="h-10 rounded-none border-slate-300 focus:ring-black"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Address</Label>
                                    <Input
                                        value={party.address}
                                        onChange={(e) => updateNestedItem('accusedDetails', idx, 'address', e.target.value)}
                                        className="h-10 rounded-none border-slate-300 focus:ring-black"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-black font-black text-xs uppercase tracking-tighter hover:bg-black hover:text-white h-10 px-4 border border-black rounded-none"
                        onClick={() => addListItem('accusedDetails', { name: "", age: "", occupation: "", address: "" })}
                    >
                        <Plus className="h-4 w-4 mr-2" /> ADD {formData.clientParty === formData.party1Label ? formData.party2Label : formData.party1Label}
                    </Button>
                </div>
            </Section>

            {/* Court Details */}
            <Section
                title="Court Details"
                extra={
                    <Button type="button" variant="outline" className="h-8 border-black text-black hover:bg-black hover:text-white rounded-none text-[10px] font-bold" onClick={() => navigate("/drafts/courts")}>
                        <Home className="h-3 w-3 mr-1" /> ADD NEW COURT
                    </Button>
                }
            >
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase">Select Court *</Label>
                    <Select value={formData.courtId} onValueChange={(v) => setFormData({ ...formData, courtId: v })}>
                        <SelectTrigger className="h-12 border-slate-300 focus:ring-black rounded-none">
                            <SelectValue placeholder="Search & Select Court" />
                        </SelectTrigger>
                        <SelectContent>
                            {courts.map(c => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.courtName} - {c.city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Section>

            {/* Case Details */}
            <Section title="Case Details">
                <div className="space-y-6">
                    {formData.caseNumberDetails.map((caseDetail, idx) => (
                        <div key={idx} className="relative p-6 border border-slate-200 bg-slate-50/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Case Info #{idx + 1}</span>
                                {idx > 0 && (
                                    <Button type="button" variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8" onClick={() => removeListItem('caseNumberDetails', idx)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Case Type *</Label>
                                    <Select value={caseDetail.caseType} onValueChange={(v) => updateNestedItem('caseNumberDetails', idx, 'caseType', v)}>
                                        <SelectTrigger className="h-10 border-slate-300 rounded-none bg-white">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CrlMP">CRIMINAL MISCELLANEOUS PETN.</SelectItem>
                                            <SelectItem value="OS">ORIGINAL SUIT</SelectItem>
                                            <SelectItem value="AS">APPEAL SUIT</SelectItem>
                                            <SelectItem value="Cr.No">CRIME NUMBER</SelectItem>
                                            <SelectItem value="CC">CALENDAR CASE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {caseDetail.caseType === "Cr.No" && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Location *</Label>
                                        <Input
                                            placeholder="e.g. Aluva"
                                            value={caseDetail.location}
                                            onChange={(e) => updateNestedItem('caseNumberDetails', idx, 'location', e.target.value)}
                                            className="h-10 rounded-none border-slate-300 bg-white"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Case Number *</Label>
                                    <Input
                                        placeholder="No"
                                        value={caseDetail.caseNo}
                                        onChange={(e) => updateNestedItem('caseNumberDetails', idx, 'caseNo', e.target.value)}
                                        className="h-10 rounded-none border-slate-300 bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Year *</Label>
                                    <Input
                                        type="number"
                                        value={caseDetail.caseNoOf}
                                        onChange={(e) => updateNestedItem('caseNumberDetails', idx, 'caseNoOf', e.target.value)}
                                        className="h-10 rounded-none border-slate-300 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-black font-black text-xs uppercase tracking-tighter hover:bg-black hover:text-white h-10 px-4 border border-black rounded-none"
                        onClick={() => addListItem('caseNumberDetails', { caseType: "CrlMP", caseNo: "", caseNoOf: new Date().getFullYear().toString(), location: "" })}
                    >
                        <Plus className="h-4 w-4 mr-2" /> ADD CASE INFO
                    </Button>
                </div>
            </Section>

            {/* Relevant Acts & Sections */}
            <Section title="Relevant Acts & Sections">
                <div className="space-y-4">
                    {formData.relevantActsAndSections.map((act, idx) => (
                        <div key={idx} className="flex gap-3 items-end">
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs font-bold uppercase">Act Name</Label>
                                <Input
                                    placeholder="e.g., IPC"
                                    className="h-12 border-slate-300 rounded-none"
                                    value={act.actName}
                                    onChange={(e) => updateNestedItem('relevantActsAndSections', idx, 'actName', e.target.value)}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs font-bold uppercase">Sections (comma separated)</Label>
                                <Input
                                    placeholder="e.g., 302, 307"
                                    className="h-12 border-slate-300 rounded-none"
                                    value={act.sections.join(", ")}
                                    onChange={(e) => updateNestedItem('relevantActsAndSections', idx, 'sections', e.target.value.split(",").map(s => s.trim()))}
                                />
                            </div>
                            {idx > 0 && (
                                <Button type="button" variant="ghost" size="icon" className="mb-1 text-red-600" onClick={() => removeListItem('relevantActsAndSections', idx)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="link" className="p-0 text-xs font-bold underline text-black uppercase" onClick={() => addListItem('relevantActsAndSections', { actName: "", sections: [""] })}>
                        <Plus className="h-3 w-3 mr-1" /> ADD ANOTHER ACT
                    </Button>
                </div>
            </Section>

            {/* Key Points */}
            <Section title="Crucial Points for AI Drafting">
                <div className="space-y-4">
                    {formData.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Textarea
                                placeholder={`Crucial point #${idx + 1}`}
                                className="min-h-[80px] border-slate-300 rounded-none focus:ring-black"
                                value={point}
                                onChange={(e) => {
                                    const newPoints = [...formData.keyPoints];
                                    newPoints[idx] = e.target.value;
                                    setFormData({ ...formData, keyPoints: newPoints });
                                }}
                            />
                            {idx > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="text-red-600" onClick={() => removeListItem('keyPoints', idx)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="link" className="p-0 text-xs font-bold underline text-black uppercase" onClick={() => addListItem('keyPoints', "")}>
                        <Plus className="h-3 w-3 mr-1" /> ADD ANOTHER POINT
                    </Button>
                </div>
            </Section>

            {/* Advocate Details */}
            <Section title={`Advocate Details (${formData.advocateIds.length} selected)`}>
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest px-1">Advocates *</Label>
                    <Select onValueChange={(v) => {
                        if (!formData.advocateIds.includes(v)) {
                            setFormData({ ...formData, advocateIds: [...formData.advocateIds, v] });
                        }
                    }}>
                        <SelectTrigger className="h-12 border-slate-300 focus:ring-black rounded-none">
                            <SelectValue placeholder="Select Advocates" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map(u => (
                                <SelectItem key={u.id} value={String(u.id)}>{u.username}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.advocateIds.map(id => {
                            const user = users.find(u => String(u.id) === id);
                            return (
                                <div key={id} className="flex items-center gap-2 bg-black text-white px-3 py-1 text-sm font-bold">
                                    {user?.username || id}
                                    <X className="h-3 w-3 cursor-pointer hover:text-slate-300" onClick={() => setFormData({ ...formData, advocateIds: formData.advocateIds.filter(aid => aid !== id) })} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Section>

            {/* Submit */}
            <Button
                type="submit"
                className="w-full h-16 bg-black hover:bg-slate-900 text-white text-xl font-black uppercase tracking-widest shadow-2xl active:scale-[0.99] transition-all rounded-none"
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "PROCEED TO AI GENERATION"}
            </Button>
        </form>
    );
}

function Section({ title, children, extra }: { title: string, children: React.ReactNode, extra?: React.ReactNode }) {
    return (
        <Card className="border border-slate-200 shadow-none overflow-hidden bg-white rounded-none">
            <CardHeader className="py-4 px-6 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black text-black uppercase tracking-widest leading-none">{title}</CardTitle>
                {extra}
            </CardHeader>
            <CardContent className="p-8">
                {children}
            </CardContent>
        </Card>
    );
}

function Card({ children, className }: any) { return <div className={`border rounded-none ${className}`}>{children}</div> }
function CardHeader({ children, className }: any) { return <div className={`flex items-center ${className}`}>{children}</div> }
function CardTitle({ children, className }: any) { return <h3 className={`${className}`}>{children}</h3> }
function CardContent({ children, className }: any) { return <div className={`${className}`}>{children}</div> }
