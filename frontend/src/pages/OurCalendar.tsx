import { useState } from "react";
import { Calendar, dateFnsLocalizer, type SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    description?: string;
}

const initialEvents: CalendarEvent[] = [
    {
        id: 1,
        title: "Team Meeting",
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 0, 0, 0)),
        description: "Discuss project updates"
    },
    {
        id: 2,
        title: "Client Call",
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(15, 0, 0, 0)),
        description: "Initial consultation"
    }
];

export default function OurCalendar() {
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: "",
        start: new Date(),
        end: new Date()
    });

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        setNewEvent({
            title: "",
            start: slotInfo.start as Date,
            end: slotInfo.end as Date,
            allDay: slotInfo.action === 'doubleClick' ? true : false
        });
        setIsDialogOpen(true);
    };

    const handleSaveEvent = () => {
        if (!newEvent.title || !newEvent.start || !newEvent.end) return;

        const event: CalendarEvent = {
            id: Math.random(),
            title: newEvent.title,
            start: newEvent.start,
            end: newEvent.end,
            allDay: newEvent.allDay,
            description: newEvent.description
        };

        setEvents([...events, event]);
        setIsDialogOpen(false);
    };

    return (
        <div className="p-6 h-[calc(100vh-2rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Our Calendar</h1>
                    <p className="text-muted-foreground">Manage your firm's schedule and events.</p>
                </div>
                <Button onClick={() => {
                    setNewEvent({ title: "", start: new Date(), end: new Date() });
                    setIsDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </div>

            <div className="flex-1 bg-card rounded-md border p-4 shadow-sm">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={(event) => alert(event.title)}
                    views={['month', 'week', 'day', 'agenda']}
                    defaultView="month"
                />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                        <DialogDescription>
                            Create a new event in the calendar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={newEvent.title || ''}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={newEvent.description || ''}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        {/* Simple date inputs for now, could be enhanced with date pickers */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="start" className="text-right">Start</Label>
                            <Input
                                id="start"
                                type="datetime-local"
                                value={newEvent.start ? format(newEvent.start, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="end" className="text-right">End</Label>
                            <Input
                                id="end"
                                type="datetime-local"
                                value={newEvent.end ? format(newEvent.end, "yyyy-MM-dd'T'HH:mm") : ''}
                                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEvent}>Save Event</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
