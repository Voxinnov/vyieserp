
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Gavel, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import VakalathForm from "./components/VakalathForm";
import PetitionForm from "./components/PetitionForm";
import { toast } from "sonner";

const PARTY_LABELS = [
    "Appellants",
    "Defendant/Respondent",
    "Respondent(The state)",
    "Petitioner(Claimant)",
    "Respondent/opposite party",
    "Plaintiff/petitioner",
    "Defendant",
    "Defendant(s)",
    "Plaintiff",
    "Respondents/Opponents",
    "Accused",
    "Applicant"
];

export default function NewDraft() {
    const [step, setStep] = useState(1); // 1: Select Details, 2: Fill Form
    const [loading, setLoading] = useState(true);
    const [types, setTypes] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [selection, setSelection] = useState({
        typeId: "",
        categoryId: "",
        party1Label: "",
        party2Label: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        api.get("/drafts/types").then(res => {
            setTypes(res.data);
            setLoading(false);
        }).catch(() => {
            toast.error("Failed to load draft patterns");
            setLoading(false);
        });
    }, []);

    const handleTypeChange = (value: string) => {
        const type = types.find(t => String(t.id) === value);
        setSelectedType(type);
        setSelection({
            ...selection,
            typeId: value,
            categoryId: type?.categories?.[0]?.id ? String(type.categories[0].id) : ""
        });
    };

    const handleProceed = () => {
        if (!selection.typeId) {
            toast.error("Please select a draft type");
            return;
        }
        if (!selection.party1Label) {
            toast.error("Please select a label for the First Party (Petitioner/Plaintiff)");
            return;
        }
        if (!selection.party2Label) {
            toast.error("Please select a label for the Second Party (Respondent/Defendant)");
            return;
        }
        setStep(2);
    };

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin h-10 w-10 text-black" /></div>;

    if (step === 2) {
        const type = selectedType;
        const formProps = {
            draftType: {
                ...type,
                selectedCategory: type.categories?.find((c: any) => String(c.id) === selection.categoryId)
            },
            initialParties: {
                party1Label: selection.party1Label,
                party2Label: selection.party2Label
            },
            onCancel: () => setStep(1)
        };

        return (
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="hover:bg-slate-100 text-black">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-black">
                            Create {type?.name}
                        </h2>
                        <p className="text-muted-foreground">Fill in the details for your legal document.</p>
                    </div>
                </div>
                <div className="bg-card border rounded-xl p-8 shadow-xl border-slate-200">
                    {type?.name.toLowerCase().includes("vakalath") || type?.name.toLowerCase().includes("vakkalath") ? (
                        <VakalathForm {...formProps} />
                    ) : (
                        <PetitionForm {...formProps} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/drafts")} className="hover:bg-slate-100 text-black">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-black">Draft Configuration</h2>
                        <p className="text-muted-foreground">Select the basic structure for your new legal document.</p>
                    </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Gavel className="h-6 w-6 text-black" />
                </div>
            </div>

            <Card className="shadow-xl border-slate-200 rounded-2xl overflow-hidden ring-1 ring-slate-100">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
                    <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-slate-400" /> Selection Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-black uppercase tracking-widest px-1">Draft Type</Label>
                            <Select onValueChange={handleTypeChange}>
                                <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-black rounded-xl text-black">
                                    <SelectValue placeholder="Select Draft Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {types.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedType?.categories?.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="text-xs font-bold text-black uppercase tracking-widest px-1">Category</Label>
                                <Select value={selection.categoryId} onValueChange={(v) => setSelection({ ...selection, categoryId: v })}>
                                    <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-black rounded-xl text-black">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {selectedType.categories.map((c: any) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-black uppercase tracking-widest px-1">First Party (Petitioner/Plaintiff) *</Label>
                            <Select value={selection.party1Label} onValueChange={(v) => setSelection({ ...selection, party1Label: v })}>
                                <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-black rounded-xl text-black">
                                    <SelectValue placeholder="Select Label *" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {PARTY_LABELS.map(label => (
                                        <SelectItem key={label} value={label}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-black uppercase tracking-widest px-1">Second Party (Respondent/Defendant) *</Label>
                            <Select value={selection.party2Label} onValueChange={(v) => setSelection({ ...selection, party2Label: v })}>
                                <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-black rounded-xl text-black">
                                    <SelectValue placeholder="Select Label *" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {PARTY_LABELS.map(label => (
                                        <SelectItem key={label} value={label}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            onClick={handleProceed}
                            className="w-full h-14 bg-black hover:bg-slate-900 text-white text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                        >
                            Proceed to Draft Generation
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
