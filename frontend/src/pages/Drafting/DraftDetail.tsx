
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, Printer, FileEdit } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Draft {
    id: number;
    generatedHtml: string;
    party1Label: string;
    party2Label: string;
    type?: { name: string };
    pdfPath?: string;
}

export default function DraftDetail() {
    const { id } = useParams();
    const [draft, setDraft] = useState<Draft | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const response = await api.get(`/drafts/${id}`);
                setDraft(response.data);
            } catch (error) {
                toast.error("Failed to load draft");
            } finally {
                setLoading(false);
            }
        };
        fetchDraft();
    }, [id]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && draft) {
            printWindow.document.write(draft.generatedHtml);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleDownload = async () => {
        try {
            toast.promise(api.get(`/drafts/${id}/pdf`, { responseType: 'blob' }), {
                loading: 'Generating PDF...',
                success: (response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `draft_${id}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    return 'PDF downloaded successfully';
                },
                error: 'Failed to generate PDF'
            });
        } catch (error) {
            toast.error("Failed to generate PDF");
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;
    if (!draft) return <div className="p-6">Draft not found</div>;

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/drafts")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Drafts
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b bg-muted/50">
                    <CardTitle>{draft.type?.name}: {draft.party1Label} vs {draft.party2Label}</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div
                        className="prose prose-sm max-w-none bg-white p-8 shadow-inner border rounded-sm overflow-auto max-h-[70vh]"
                        dangerouslySetInnerHTML={{ __html: draft.generatedHtml }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
