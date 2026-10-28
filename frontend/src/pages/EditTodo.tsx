import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import TodoForm from "@/components/TodoForm";

export default function EditTodo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<any>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodo();
    }, [id]);

    const fetchTodo = async () => {
        try {
            const response = await api.get(`/todos/${id}`);
            setInitialData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching todo:", error);
            alert("Failed to load to-do.");
            navigate("/todos");
        }
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await api.put(`/todos/${id}`, data);
            navigate("/todos");
        } catch (error) {
            console.error("Error updating to-do:", error);
            alert("Failed to update to-do. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return <TodoForm initialData={initialData} onSubmit={handleSubmit} isSubmitting={isSubmitting} title="Edit To-Do" />;
}
