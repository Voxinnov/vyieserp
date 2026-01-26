import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import TaskForm from "@/components/TaskForm";

export default function EditTask() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTask();
    }, [id]);

    const fetchTask = async () => {
        if (!id) return;
        try {
            const response = await api.get(`/tasks/${id}`);
            // Ensure fields are not null for the form (controlled inputs)
            const taskData = response.data;
            const sanitizedTask = {
                ...taskData,
                case_number: taskData.case_number || "",
                court: taskData.court || "",
                cnr_number: taskData.cnr_number || "",
                last_hearing_date: taskData.last_hearing_date || "",
                next_hearing_date: taskData.next_hearing_date || "",
                advocates: taskData.advocates || "",
                tags: taskData.tags || "",
                description: taskData.description || "",
                doc_collection_message: taskData.doc_collection_message || ""
            };
            setTask(sanitizedTask);
        } catch (error) {
            console.error("Error fetching task:", error);
            alert("Failed to fetch task details.");
            navigate("/tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await api.put(`/tasks/${id}`, data);
            navigate("/tasks");
        } catch (error) {
            console.error("Error updating task:", error);
            alert("Failed to update task. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading task details...</div>;
    }

    if (!task) {
        return <div className="p-6 text-center">Task not found.</div>;
    }

    return (
        <TaskForm
            initialData={task}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            title={`Edit Task: ${task.case_number}`}
        />
    );
}
