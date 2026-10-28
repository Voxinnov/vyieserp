import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import TodoForm from "@/components/TodoForm";

export default function CreateTodo() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await api.post("/todos", data);
            navigate("/todos");
        } catch (error) {
            console.error("Error creating to-do:", error);
            alert("Failed to create to-do. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return <TodoForm onSubmit={handleSubmit} isSubmitting={isSubmitting} title="Create New To-Do" />;
}
