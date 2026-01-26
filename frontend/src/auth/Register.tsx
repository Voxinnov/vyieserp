import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gavel } from "lucide-react";

const registerSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(10, "Invalid mobile number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["advocate", "associate", "clerk", "accountant", "client"]),
    barRegistrationNumber: z.string().optional(),
    officeName: z.string().optional(),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "client",
            terms: false,
        },
    });

    const selectedRole = watch("role");

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        console.log("Register data:", data);
        // Simulate API call
        setTimeout(() => {
            navigate("/login");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4 py-8">
            <Card className="w-full max-w-xl shadow-lg border-0 sm:border sm:bg-card">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary p-3 rounded-full">
                            <Gavel className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
                    <CardDescription>
                        Join the VYISEDESK platform to manage your practice
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
                                {errors.fullName && <p className="text-destructive text-xs">{errors.fullName.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
                                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input id="mobile" {...register("mobile")} placeholder="+1 234 567 8900" />
                                {errors.mobile && <p className="text-destructive text-xs">{errors.mobile.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    {...register("role")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="client">Client</option>
                                    <option value="advocate">Advocate</option>
                                    <option value="associate">Associate</option>
                                    <option value="clerk">Clerk / Assistant</option>
                                    <option value="accountant">Accountant</option>
                                </select>
                                {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
                            </div>
                        </div>

                        {(selectedRole === "advocate" || selectedRole === "associate") && (
                            <div className="grid gap-2">
                                <Label htmlFor="barRegistrationNumber">Bar Registration Number</Label>
                                <Input id="barRegistrationNumber" {...register("barRegistrationNumber")} placeholder="BAR/1234/2023" />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="officeName">Office / Firm Name</Label>
                            <Input id="officeName" {...register("officeName")} placeholder="Legal & Partners" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" {...register("password")} />
                                {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                                {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="terms" className="hidden" />
                            <input
                                type="checkbox"
                                id="terms-native"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                {...register("terms")}
                            />
                            <label
                                htmlFor="terms-native"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I agree to the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                            </label>
                        </div>
                        {errors.terms && <p className="text-destructive text-xs">{errors.terms.message}</p>}

                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
