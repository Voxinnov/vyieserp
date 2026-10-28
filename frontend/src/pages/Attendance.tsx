import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, parse } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// --- Types ---

interface AttendanceRecord {
    user_id: number;
    username: string;
    email: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Paid Leave' | 'Holiday' | 'Weekend';
}

interface SummaryStats {
    present: number;
    halfDay: number;
    overtime: number;
    weekend: number;
    holiday: number;
    absent: number;
    leave: number;
    paidLeave: number;
}

// --- Status Badge Component ---

const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = "bg-gray-100 text-gray-800";
    if (status === "Present") colorClass = "bg-green-100 text-green-800";
    else if (status === "Absent") colorClass = "bg-red-100 text-red-800";
    else if (status === "Half Day") colorClass = "bg-yellow-100 text-yellow-800";
    else if (status === "Leave") colorClass = "bg-orange-100 text-orange-800";
    else if (status === "Paid Leave") colorClass = "bg-blue-100 text-blue-800";
    else if (status === "Weekend" || status === "Holiday") colorClass = "bg-purple-100 text-purple-800";

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
            {status}
        </span>
    );
};

// --- Main Component ---

export default function Attendance() {
    const { user } = useAuth();
    const isAdmin = String(user?.role || '').toLowerCase().includes("admin"); // Simplistic role check
    const [view, setView] = useState<'daily' | 'monthly'>('daily');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Admin Bulk/Edit States
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [bulkStatus, setBulkStatus] = useState<string>("Present");

    useEffect(() => {
        if (view === 'daily') {
            fetchDailyAttendance();
        } else {
            fetchMonthlyAttendance(); // For admin monthly view or user monthly view
        }
    }, [selectedDate, view]);

    const fetchDailyAttendance = async () => {
        setLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const res = await api.get(`/attendance/daily?date=${dateStr}`);
            // If user is employee, filter to self unless the API handles it (our API returns all currently)
            // Ideally backend filters, but for now specific logic:
            if (!isAdmin) {
                setAttendanceData(res.data.filter((r: AttendanceRecord) => r.user_id === user?.id));
            } else {
                setAttendanceData(res.data);
            }
        } catch (error) {
            console.error("Error fetching daily attendance", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyAttendance = async () => {
        // Logic for monthly fetch can be complex depending on if it's admin grid or user summary
        // Reusing daily endpoint for simplicity isn't enough. We need the monthly report endpoint.
        setLoading(true);
        try {
            // Fetch entire month for all users (admin) or self (employee)
            // The backend logic needs to support date ranges or month param
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            const res = await api.get(`/attendance/monthly?month=${month}&year=${year}${!isAdmin ? `&user_id=${user?.id}` : ''}`);

            // Transform flat list to something usable for grid if needed
            // For now, just storing raw data
            setAttendanceData(res.data);

        } catch (error) {
            console.error("error fetching monthly", error);
        } finally {
            setLoading(false);
        }
    };


    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/checkin');
            fetchDailyAttendance();
        } catch (error) {
            alert("Check-in failed");
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/checkout');
            fetchDailyAttendance();
        } catch (error) {
            alert("Check-out failed");
        }
    };

    const handleMarkAttendance = async (userId: number, status: string) => {
        try {
            await api.post('/attendance/mark', {
                user_id: userId,
                date: format(selectedDate, 'yyyy-MM-dd'),
                status: status
            });
            fetchDailyAttendance();
        } catch (error) {
            alert("Failed to mark attendance");
        }
    };

    const handleBulkUpdate = async () => {
        try {
            await api.post('/attendance/bulk', {
                user_ids: selectedUsers,
                date: format(selectedDate, 'yyyy-MM-dd'),
                status: bulkStatus
            });
            setIsBulkDialogOpen(false);
            fetchDailyAttendance();
            setSelectedUsers([]);
        } catch (error) {
            alert("Bulk update failed");
        }
    };

    // --- Helper for Stats ---
    const calculateStats = (data: AttendanceRecord[]): SummaryStats => {
        const stats = {
            present: 0, halfDay: 0, overtime: 0, weekend: 0, holiday: 0, absent: 0, leave: 0, paidLeave: 0
        };
        data.forEach(r => {
            if (r.status === 'Present') stats.present++;
            else if (r.status === 'Absent') stats.absent++;
            else if (r.status === 'Half Day') stats.halfDay++;
            else if (r.status === 'Leave') stats.leave++;
            else if (r.status === 'Paid Leave') stats.paidLeave++;
            else if (r.status === 'Holiday') stats.holiday++;
            else if (r.status === 'Weekend') stats.weekend++;
        });
        return stats;
    };

    // --- Renderers ---

    const renderDailyView = () => {
        if (loading) return <div>Loading...</div>;

        const stats = calculateStats(attendanceData);

        return (
            <div className="space-y-6">
                {/* Date Picker */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-md border">
                    <div className="w-1/3">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={format(selectedDate, 'yyyy-MM-dd')}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <div className="bg-card p-3 rounded shadow-sm border text-center">
                        <div className="text-xl font-bold text-green-600">{stats.present}</div>
                        <div className="text-xs text-muted-foreground uppercase">Present</div>
                    </div>
                    <div className="bg-card p-3 rounded shadow-sm border text-center">
                        <div className="text-xl font-bold text-yellow-600">{stats.halfDay}</div>
                        <div className="text-xs text-muted-foreground uppercase">Half Day</div>
                    </div>
                    <div className="bg-card p-3 rounded shadow-sm border text-center">
                        <div className="text-xl font-bold text-blue-600">{stats.overtime}</div>
                        <div className="text-xs text-muted-foreground uppercase">Overtime</div>
                    </div>
                    <div className="bg-card p-3 rounded shadow-sm border text-center">
                        <div className="text-xl font-bold text-red-600">{stats.absent}</div>
                        <div className="text-xs text-muted-foreground uppercase">Absent</div>
                    </div>
                    <div className="bg-card p-3 rounded shadow-sm border text-center">
                        <div className="text-xl font-bold text-orange-600">{stats.leave}</div>
                        <div className="text-xs text-muted-foreground uppercase">Leave</div>
                    </div>
                </div>

                {/* Employee Self Actions for Daily View */}
                {!isAdmin && (
                    <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-lg">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{user?.username}</h3>
                                {user && attendanceData[0] ? (
                                    <p className="text-sm text-gray-500">
                                        Check In - {attendanceData[0].check_in || '--'} | Check Out - {attendanceData[0].check_out || '--'}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">No records today</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {attendanceData[0] && <StatusBadge status={attendanceData[0].status} />}

                            {/* Check In / Out Buttons */}
                            {(!attendanceData[0] || !attendanceData[0].check_in) && (
                                <Button className="bg-primary" onClick={handleCheckIn}>Check In</Button>
                            )}
                            {attendanceData[0] && attendanceData[0].check_in && !attendanceData[0].check_out && (
                                <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleCheckOut}>Check Out</Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Admin Table View */}
                {isAdmin && (
                    <div className="bg-white rounded-md border shadow-sm">
                        <div className="p-4 flex justify-between items-center border-b">
                            <h3 className="font-semibold">Employee Attendance</h3>
                            <Button size="sm" onClick={() => setIsBulkDialogOpen(true)}>Bulk Attendance</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <input type="checkbox" onChange={(e) => {
                                                if (e.target.checked) setSelectedUsers(attendanceData.map(r => r.user_id));
                                                else setSelectedUsers([]);
                                            }} />
                                        </th>
                                        <th className="px-4 py-3">Employee</th>
                                        <th className="px-4 py-3">Check In</th>
                                        <th className="px-4 py-3">Check Out</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Values</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.map((record) => (
                                        <tr key={record.user_id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(record.user_id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedUsers([...selectedUsers, record.user_id]);
                                                        else setSelectedUsers(selectedUsers.filter(id => id !== record.user_id));
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                                                        {record.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {record.username}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{record.check_in || '--'}</td>
                                            <td className="px-4 py-3 text-gray-500">{record.check_out || '--'}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={record.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="border rounded text-xs p-1"
                                                    value={record.status}
                                                    onChange={(e) => handleMarkAttendance(record.user_id, e.target.value)}
                                                >
                                                    <option value="Present">Present</option>
                                                    <option value="Absent">Absent</option>
                                                    <option value="Half Day">Half Day</option>
                                                    <option value="Leave">Leave</option>
                                                    <option value="Paid Leave">Paid Leave</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {/* Edit icon potentially */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderMonthlyView = () => {
        // Generate days for the month
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        const days = eachDayOfInterval({ start, end });

        // Simple User List (mock or extracted from data)
        // For admin monthly view: Rows are Users, Cols are days
        // For employee monthly view: Calendar grid or simplified list

        if (isAdmin) {
            // Unique Users
            const uniqueUsers = Array.from(new Set(attendanceData.map(a => JSON.stringify({ id: a.user_id, name: a.username }))))
                .map(s => JSON.parse(s));

            return (
                <div className="space-y-4">
                    {/* Month Selector */}
                    <div className="flex item-center gap-4 bg-card p-4 rounded-md border">
                        <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold w-40 text-center">{format(selectedDate, 'MMMM yyyy')}</h2>
                        <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 border sticky left-0 bg-gray-50 min-w-[150px] z-10">User</th>
                                    {days.map(day => (
                                        <th key={day.toString()} className={`p-2 border min-w-[40px] text-center ${getDay(day) === 0 ? 'bg-red-50 text-red-700' : ''}`}>
                                            <div className="font-bold">{format(day, 'dd')}</div>
                                            <div className="text-[10px] font-normal">{format(day, 'EEE')}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {uniqueUsers.map((u: any) => (
                                    <tr key={u.id}>
                                        <td className="p-2 border sticky left-0 bg-white font-medium z-10">{u.name}</td>
                                        {days.map(day => {
                                            const record = attendanceData.find(a =>
                                                a.user_id === u.id &&
                                                isSameDay(new Date(a.date), day) // Assuming backend sends date string ISO
                                                // Note: Timezone mismatches common here. Assuming local date string from backend.
                                            );
                                            // Handle Status codes to colors/Initials
                                            let cellContent = "";
                                            let cellClass = "";

                                            if (record) {
                                                if (record.status === 'Present') { cellContent = "P"; cellClass = "bg-green-100 text-green-700"; }
                                                else if (record.status === 'Absent') { cellContent = "A"; cellClass = "bg-red-100 text-red-700"; }
                                                else if (record.status === 'Half Day') { cellContent = "HD"; cellClass = "bg-yellow-100 text-yellow-700"; }
                                                else if (record.status === 'Leave') { cellContent = "L"; cellClass = "bg-orange-100 text-orange-700"; }
                                            }

                                            return (
                                                <td key={day.toString()} className={`p-1 border text-center ${cellClass}`}>
                                                    {cellContent}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else {
            // Employee Calendar View
            return (
                <div className="space-y-4">
                    {/* Month Selector */}
                    <div className="flex item-center gap-4 bg-card p-4 rounded-md border">
                        <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold w-40 text-center">{format(selectedDate, 'MMMM yyyy')}</h2>
                        <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-gray-200 border rounded-lg overflow-hidden">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-500">
                                {d}
                            </div>
                        ))}

                        {/* Empty padding days */}
                        {Array.from({ length: getDay(start) }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-white min-h-[100px]" />
                        ))}

                        {days.map(day => {
                            const record = attendanceData.find(a => a.user_id === user?.id && isSameDay(parse(a.date, 'yyyy-MM-dd', new Date()), day)); // Assuming date is yyyy-mm-dd
                            let statusColor = "";
                            if (record?.status === 'Present') statusColor = "bg-green-50 border-green-200";
                            else if (record?.status === 'Absent') statusColor = "bg-red-50 border-red-200";
                            else if (record?.status === 'Leave') statusColor = "bg-orange-50 border-orange-200";

                            return (
                                <div key={day.toString()} className={`bg-white min-h-[100px] p-2 border border-transparent hover:border-blue-300 transition-colors ${statusColor}`}>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {record && <div className="text-[10px] font-bold uppercase">{record.status}</div>}
                                    </div>
                                    {record && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            <div>In: {record.check_in?.substring(0, 5) || '-'}</div>
                                            <div>Out: {record.check_out?.substring(0, 5) || '-'}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setView('daily')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${view === 'daily' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setView('monthly')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${view === 'monthly' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Monthly
                    </button>
                </nav>
            </div>

            {/* Content */}
            {view === 'daily' ? renderDailyView() : renderMonthlyView()}

            {/* Bulk Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Mark Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Label>Select Status for {selectedUsers.length} Users</Label>
                        <select
                            className="w-full border rounded p-2"
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                        >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Leave">Leave</option>
                            <option value="Paid Leave">Paid Leave</option>
                        </select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkUpdate}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
