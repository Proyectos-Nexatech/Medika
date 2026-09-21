import os

filepath = r"c:\Users\EQC0670\Medika\apps\web\src\modules\appointments\pages\AgendaPage.tsx"

content = """import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { appointmentService } from '../services/appointment.service';
import { consultationService } from '../../consultations/services/consultation.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);

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
      patient_id: a.patient_id,
      professional_id: a.professional_id,
      title: `${a.patients?.first_name} ${a.patients?.last_name} - ${a.services?.name}`,
      start: new Date(a.appointment_date.split('T')[0] + 'T' + a.start_time),
      end: new Date(a.appointment_date.split('T')[0] + 'T' + a.end_time),
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

  const handleStartConsultation = async () => {
    if (!selectedEvent) return;
    setIsStarting(true);
    try {
      const consultation = await consultationService.getOrCreateDraft(
        selectedEvent.id, 
        organizationId!, 
        selectedEvent.patient_id, 
        selectedEvent.professional_id
      );
      navigate(`/workspace/${consultation.id}`);
    } catch (err) {
      console.error('Error al iniciar consulta:', err);
      alert('Error técnico al iniciar la consulta.');
    } finally {
      setIsStarting(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      </div>
      
      <Card className="h-full flex flex-col p-4 shadow-sm z-0 relative">
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
              onSelectEvent={setSelectedEvent}
              views={['month', 'week', 'day', 'agenda']}
              defaultView={Views.MONTH}
            />
          )}
        </CardContent>
      </Card>

      {/* MODAL PERSONALIZADO */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                Detalles de la Cita
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Paciente</p>
                <p className="text-xl font-bold text-medika-900">{selectedEvent.title.split(' - ')[0]}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Servicio Programado</p>
                <p className="text-base text-slate-700 bg-slate-50 p-2 rounded-md border border-slate-100">{selectedEvent.title.split(' - ')[1]}</p>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Estado</p>
                  <p className="text-sm font-bold capitalize text-slate-700 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedEvent.status === 'pending' ? 'bg-amber-500' : selectedEvent.status === 'confirmed' ? 'bg-blue-500' : selectedEvent.status === 'attended' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {selectedEvent.status === 'pending' ? 'Pendiente' : selectedEvent.status === 'confirmed' ? 'Confirmada' : selectedEvent.status === 'attended' ? 'Atendida' : 'Cancelada'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500 mb-1">Hora</p>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedEvent.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                disabled={isStarting}
              >
                Cerrar
              </button>
              
              {selectedEvent.status !== 'cancelled' && (
                <button 
                  onClick={handleStartConsultation}
                  disabled={isStarting}
                  className="px-5 py-2 text-sm font-medium text-white bg-medika-600 rounded-md hover:bg-medika-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                >
                  {isStarting ? 'Abriendo...' : 'Atender Paciente'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
