import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { consultationService } from '../../consultations/services/consultation.service';
import { patientService } from '../../patients/services/patient.service';
import { professionalService } from '../../professionals/services/professional.service';
import { catalogService } from '../../services/services/catalog.service';
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
  const queryClient = useQueryClient();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);
  
  const [schedulingSlot, setSchedulingSlot] = useState<{ start: Date, end: Date } | null>(null);
  const [formPat, setFormPat] = useState('');
  const [formProf, setFormProf] = useState('');
  const [formServ, setFormServ] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', organizationId, startDate, endDate],
    queryFn: () => appointmentService.getAppointments(organizationId!, startDate, endDate),
    enabled: !!organizationId,
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', organizationId],
    queryFn: () => patientService.getPatients(organizationId!),
    enabled: !!organizationId,
  });

  const { data: professionals } = useQuery({
    queryKey: ['professionals', organizationId],
    queryFn: () => professionalService.getProfessionals(organizationId!),
    enabled: !!organizationId,
  });

  const { data: services } = useQuery({
    queryKey: ['services', organizationId],
    queryFn: () => catalogService.getServices(organizationId!),
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
      case 'pending': backgroundColor = '#f59e0b'; break;
      case 'confirmed': backgroundColor = '#3b82f6'; break;
      case 'attended': backgroundColor = '#10b981'; break;
      case 'cancelled': backgroundColor = '#ef4444'; break;
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

  const handleSelectSlot = (slotInfo: any) => {
    setSchedulingSlot({ start: slotInfo.start, end: slotInfo.end });
    const pad = (n: number) => n.toString().padStart(2, '0');
    // Default time based on where user clicked. If 00:00 (month view click), use 09:00.
    if (slotInfo.start.getHours() === 0 && slotInfo.start.getMinutes() === 0) {
      setFormTime('09:00');
    } else {
      setFormTime(`${pad(slotInfo.start.getHours())}:${pad(slotInfo.start.getMinutes())}`);
    }
    setFormError('');
  };

  const createAppointmentMutation = useMutation({
    mutationFn: (newAppointment: any) => appointmentService.createAppointment(newAppointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSchedulingSlot(null);
      setFormPat('');
      setFormProf('');
      setFormServ('');
      setFormError('');
    },
    onError: (error: any) => {
      setFormError('Error al guardar la cita en la base de datos.');
      console.error(error);
    },
    onSettled: () => setIsCreating(false),
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPat || !formProf || !formServ || !schedulingSlot || !formTime) return;
    setIsCreating(true);
    setFormError('');

    const pad = (n: number) => n.toString().padStart(2, '0');
    const dt = schedulingSlot.start;
    const dateStr = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;

    const [hours, minutes] = formTime.split(':').map(Number);
    const newStartMins = hours * 60 + minutes;
    
    const selectedSrv = services?.find(s => s.id === formServ);
    const duration = selectedSrv?.duration_minutes || 30;
    const newEndMins = newStartMins + duration;

    // Validation: Check overlap
    const hasOverlap = appointments?.some((app: any) => {
      if (app.status === 'cancelled') return false;
      if (app.professional_id !== formProf) return false;
      if (app.appointment_date !== dateStr) return false;

      const [sH, sM] = app.start_time.split(':').map(Number);
      const appStartMins = sH * 60 + sM;
      
      const [eH, eM] = app.end_time.split(':').map(Number);
      const appEndMins = eH * 60 + eM;

      return (newStartMins < appEndMins && newEndMins > appStartMins);
    });

    if (hasOverlap) {
      setFormError('El profesional seleccionado ya tiene una cita asignada en ese horario.');
      setIsCreating(false);
      return;
    }

    const startStr = `${pad(hours)}:${pad(minutes)}:00`;
    const endH = Math.floor(newEndMins / 60);
    const endM = newEndMins % 60;
    const endStr = `${pad(endH)}:${pad(endM)}:00`;

    createAppointmentMutation.mutate({
      organization_id: organizationId!,
      patient_id: formPat,
      professional_id: formProf,
      service_id: formServ || null,
      appointment_date: dateStr,
      start_time: startStr,
      end_time: endStr,
      status: 'pending',
      created_by: profile!.id
    });
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
              selectable={true}
              onSelectSlot={handleSelectSlot}
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

      {/* MODAL DETALLE DE CITA */}
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

      {/* MODAL CREAR CITA */}
      {schedulingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                Agendar Cita
              </h3>
              <button onClick={() => { setSchedulingSlot(null); setFormError(''); }} className="text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 shadow-sm">
                  {formError}
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Fecha seleccionada</p>
                  <p className="text-base font-bold text-slate-900">
                    {schedulingSlot.start.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Hora de inicio</label>
                  <input 
                    type="time" 
                    required 
                    value={formTime}
                    onChange={(e) => { setFormTime(e.target.value); setFormError(''); }}
                    className="p-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500 text-sm font-semibold text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Paciente</label>
                <select 
                  required
                  value={formPat}
                  onChange={e => { setFormPat(e.target.value); setFormError(''); }}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500 focus:border-medika-500"
                >
                  <option value="">-- Seleccionar paciente --</option>
                  {patients?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.document_number})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Profesional</label>
                <select 
                  required
                  value={formProf}
                  onChange={e => { setFormProf(e.target.value); setFormError(''); }}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500 focus:border-medika-500"
                >
                  <option value="">-- Seleccionar profesional --</option>
                  {professionals?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Servicio</label>
                <select 
                  required
                  value={formServ}
                  onChange={e => { setFormServ(e.target.value); setFormError(''); }}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500 focus:border-medika-500"
                >
                  <option value="">-- Seleccionar servicio --</option>
                  {services?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button 
                  type="button"
                  onClick={() => { setSchedulingSlot(null); setFormError(''); }} 
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isCreating || !formPat || !formProf || !formServ}
                  className="px-5 py-2 text-sm font-medium text-white bg-medika-600 rounded-md hover:bg-medika-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {isCreating ? 'Guardando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
