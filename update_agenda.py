import os

filepath = r"c:\Users\EQC0670\Medika\apps\web\src\modules\appointments\pages\AgendaPage.tsx"

content = """import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { appointmentService } from '../services/appointment.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardContent } from '@/components/ui/card';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export function AgendaPage() {
  const { organizationId } = useOrganization();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtenemos rango de fechas para cargar las citas en el calendario
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', organizationId, startDate, endDate],
    queryFn: () => appointmentService.getAppointments(organizationId!, startDate, endDate),
    enabled: !!organizationId,
  });

  const events = useMemo(() => {
    if (!appointments) return [];
    return appointments.map((a: any) => ({
      id: a.id,
      title: `${a.patients?.first_name} ${a.patients?.last_name} - ${a.services?.name}`,
      start: new Date(a.start_time),
      end: new Date(a.end_time),
      status: a.status,
      professional: `${a.professionals?.first_name} ${a.professionals?.last_name}`,
    }));
  }, [appointments]);

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    switch (event.status) {
      case 'pending': backgroundColor = '#f59e0b'; break; // ambar
      case 'confirmed': backgroundColor = '#3b82f6'; break; // azul
      case 'attended': backgroundColor = '#10b981'; break; // verde
      case 'cancelled': backgroundColor = '#ef4444'; break; // rojo
    }
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px'
      }
    };
  };

  return (
    <div className="space-y-4 h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      </div>
      
      <Card className="h-full flex flex-col p-4 shadow-sm">
        <CardContent className="flex-1 p-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">Cargando calendario...</div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              culture="es"
              messages={{
                next: "Sig",
                previous: "Ant",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Cita",
                noEventsInRange: "No hay citas en este rango."
              }}
              eventPropGetter={eventStyleGetter}
              onNavigate={(date) => setCurrentDate(date)}
              views={['month', 'week', 'day', 'agenda']}
              defaultView={Views.MONTH}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
