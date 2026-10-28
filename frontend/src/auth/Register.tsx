import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gavel, Eye, EyeOff, Triangle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const registerSchema = z.object({
    fullName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(10, "Invalid mobile number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["advocate", "associate", "clerk", "accountant", "client", "organization"]),
    barRegistrationNumber: z.string().optional(),
    officeName: z.string().optional(),
    // Organization specific fields
    organizationName: z.string().optional(),
    numberOfUsers: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
    address: z.string().optional(),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
}).refine((data) => {
    if (data.role === "organization") {
        return !!data.organizationName && !!data.numberOfUsers;
    }
    return !!data.fullName;
}, {
    message: "Required fields are missing",
    path: ["fullName"],
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

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
        try {
            const signupData = {
                username: data.email, // Using email as username
                email: data.email,
                password: data.password,
                role: data.role,
                mobile: data.mobile,
                office_name: data.role === "organization" ? data.organizationName : data.officeName,
                bar_registration_number: data.barRegistrationNumber,
                number_of_users: data.numberOfUsers,
                country: data.country,
                state: data.state,
                city: data.city,
                pincode: data.pincode,
                address: data.address
            };

            await api.post("/auth/signup", signupData);

            toast.success("Registration successful! Please login.");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: any) {
            console.error("Registration error:", error);
            const message = error.response?.data?.message || "Registration failed. Please try again.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4 py-8">
            <Card className="w-full max-w-xl shadow-lg border-0 sm:border sm:bg-card">
                <CardHeader className="space-y-1 text-center py-8 rounded-t-lg">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-foreground text-background">
                            {selectedRole === "organization" ? (
                                <Triangle className="h-6 w-6 rotate-180" />
                            ) : (
                                <Gavel className="h-6 w-6" />
                            )}
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {selectedRole === "organization" ? "Organization Registration" : "Create an Account"}
                    </CardTitle>
                    <CardDescription>
                        {selectedRole === "organization" ? "Join our community today" : "Join the VYISEDESK platform to manage your practice"}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="grid gap-4">
                        {/* Common Top Fields */}
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
                                <Input id="mobile" {...register("mobile")} placeholder="+91 98765 43210" />
                                {errors.mobile && <p className="text-destructive text-xs">{errors.mobile.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    {...register("role")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="client">Client</option>
                                    <option value="advocate">Advocate</option>
                                    <option value="associate">Associate</option>
                                    <option value="clerk">Clerk / Assistant</option>
                                    <option value="accountant">Accountant</option>
                                    <option value="organization">Organization</option>
                                </select>
                                {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
                            </div>
                        </div>

                        {/* Conditional Fields */}
                        {selectedRole === "organization" ? (
                            <div className="space-y-4 pt-2">
                                <div className="border-b pb-2 mb-2">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Organization Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="organizationName">Organization Name</Label>
                                        <Input id="organizationName" {...register("organizationName")} placeholder="Enter organization name" />
                                        {errors.organizationName && <p className="text-destructive text-xs">{errors.organizationName.message}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="numberOfUsers">Number of Users</Label>
                                        <Input id="numberOfUsers" {...register("numberOfUsers")} placeholder="e.g. 5" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            </div>
                        )}

                        {/* Common Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        {...register("password")}
                                        placeholder="Create a password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    placeholder="Confirm your password"
                                />
                                {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        {/* Address Details - Common */}
                        <div className="space-y-4 pt-4">
                            <div className="border-b pb-2 mb-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Address Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <select
                                        id="country"
                                        {...register("country")}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="India">India</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="state">State</Label>
                                    <select
                                        id="state"
                                        {...register("state")}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Select a state</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" {...register("city")} placeholder="Enter city" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="pincode">Pin Code</Label>
                                    <Input id="pincode" {...register("pincode")} placeholder="682001" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" {...register("address")} placeholder="Enter full address" />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="terms-native"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                {...register("terms")}
                            />
                            <label
                                htmlFor="terms-native"
                                className="text-sm font-medium leading-none"
                            >
                                I agree to the <Link to="/terms" className="text-primary hover:underline font-bold">Terms & Conditions</Link>
                            </label>
                        </div>
                        {errors.terms && <p className="text-destructive text-xs">{errors.terms.message}</p>}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold h-12 text-lg"
                            type="submit"
                            disabled={isLoading}
                        >
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
