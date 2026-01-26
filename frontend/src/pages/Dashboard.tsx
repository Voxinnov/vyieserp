import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Briefcase, Gavel, AlertCircle, Receipt, Users, Plus, Upload, Clock
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
    { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
    { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
];

export default function Dashboard() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button><Plus className="mr-2 h-4 w-4" /> New Matter</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Matters Due</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+2 since yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hearings This Week</CardTitle>
                        <Gavel className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Next: vs State (Tomorrow)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">3</div>
                        <p className="text-xs text-muted-foreground">Urgent attention needed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,234</div>
                        <p className="text-xs text-muted-foreground">From 5 clients</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-muted-foreground">+4 new this month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Performance Chart */}
                <Card className="col-span-4 rounded-xl">
                    <CardHeader>
                        <CardTitle>Case Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Activity / Calendar */}
                <Card className="col-span-3 rounded-xl">
                    <CardHeader>
                        <CardTitle>Upcoming Hearings</CardTitle>
                        <CardDescription>You have 4 hearings this week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Gavel className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Smith vs Jones</p>
                                        <p className="text-sm text-muted-foreground">High Court, Room 302</p>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end">
                                        <div className="font-medium text-sm">Tomorrow</div>
                                        <div className="text-xs text-muted-foreground">10:00 AM</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <h3 className="text-lg font-semibold mt-8 mb-4">Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:border-primary/50 transition-all">
                    <Users className="h-6 w-6" />
                    <span>Add Client</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:border-primary/50 transition-all">
                    <Upload className="h-6 w-6" />
                    <span>Upload Document</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:border-primary/50 transition-all">
                    <Receipt className="h-6 w-6" />
                    <span>Create Invoice</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent hover:border-primary/50 transition-all">
                    <Clock className="h-6 w-6" />
                    <span>Log Time</span>
                </Button>
            </div>
        </div>
    );
}
