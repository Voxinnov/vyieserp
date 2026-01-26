import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import TaskForm from "@/components/TaskForm";

export default function CreateTask() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await api.post("/tasks", data);
            navigate("/tasks");
        } catch (error) {
            console.error("Error creating task:", error);
            alert("Failed to create task. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return <TaskForm onSubmit={handleSubmit} isSubmitting={isSubmitting} title="Create New Task" />;
}
