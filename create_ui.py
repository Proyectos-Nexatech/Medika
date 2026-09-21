import os

base_dir = r"c:\Users\EQC0670\Medika\apps\web\src"

files = {
    "modules/patients/pages/PatientListPage.tsx": """import { useQuery } from '@tanstack/react-query';
import { patientService } from '../services/patient.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function PatientListPage() {
  const { currentOrganization } = useOrganization();
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', currentOrganization?.id],
    queryFn: () => patientService.getPatients(currentOrganization!.id),
    enabled: !!currentOrganization,
  });

  if (isLoading) return <div>Cargando pacientes...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
      <Card>
        <CardHeader><CardTitle>Directorio de Pacientes</CardTitle></CardHeader>
        <CardContent>
          {patients?.length === 0 ? <p>No hay pacientes registrados.</p> : (
            <ul className="space-y-2">
              {patients?.map(p => (
                <li key={p.id} className="p-4 border rounded-md shadow-sm">
                  <p className="font-semibold">{p.first_name} {p.last_name}</p>
                  <p className="text-sm text-slate-500">{p.id_type} {p.id_number} - {p.email}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
""",
    "modules/professionals/pages/ProfessionalListPage.tsx": """import { useQuery } from '@tanstack/react-query';
import { professionalService } from '../services/professional.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function ProfessionalListPage() {
  const { currentOrganization } = useOrganization();
  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals', currentOrganization?.id],
    queryFn: () => professionalService.getProfessionals(currentOrganization!.id),
    enabled: !!currentOrganization,
  });

  if (isLoading) return <div>Cargando profesionales...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profesionales</h1>
      <Card>
        <CardHeader><CardTitle>Directorio Médico</CardTitle></CardHeader>
        <CardContent>
          {professionals?.length === 0 ? <p>No hay profesionales registrados.</p> : (
            <ul className="space-y-2">
              {professionals?.map(p => (
                <li key={p.id} className="p-4 border rounded-md shadow-sm">
                  <p className="font-semibold">{(p.users as any)?.first_name} {(p.users as any)?.last_name}</p>
                  <p className="text-sm text-slate-500">Especialidad: {p.specialty} | Licencia: {p.medical_license}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
""",
    "modules/services/pages/ServiceListPage.tsx": """import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function ServiceListPage() {
  const { currentOrganization } = useOrganization();
  const { data: services, isLoading } = useQuery({
    queryKey: ['services', currentOrganization?.id],
    queryFn: () => catalogService.getServices(currentOrganization!.id),
    enabled: !!currentOrganization,
  });

  if (isLoading) return <div>Cargando catálogo...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Catálogo de Servicios</h1>
      <Card>
        <CardHeader><CardTitle>Servicios Ofrecidos</CardTitle></CardHeader>
        <CardContent>
          {services?.length === 0 ? <p>No hay servicios configurados.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services?.map(s => (
                <div key={s.id} className="p-4 border rounded-md shadow-sm">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-slate-500">{s.duration_minutes} min | Modalidad: {s.modality}</p>
                  <p className="mt-2 font-bold text-medika-600">${s.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
""",
    "modules/appointments/pages/AgendaPage.tsx": """import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../services/appointment.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function AgendaPage() {
  const { currentOrganization } = useOrganization();
  // Por simplicidad en Fase 2 base, cargamos todo el mes actual o un rango grande
  const today = new Date();
  const [date] = useState(today.toISOString().split('T')[0]);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', currentOrganization?.id, date],
    queryFn: () => appointmentService.getAppointments(currentOrganization!.id, date + 'T00:00:00Z', date + 'T23:59:59Z'),
    enabled: !!currentOrganization,
  });

  if (isLoading) return <div>Cargando agenda...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      <Card>
        <CardHeader><CardTitle>Citas para {date}</CardTitle></CardHeader>
        <CardContent>
          {appointments?.length === 0 ? <p>No hay citas agendadas para hoy.</p> : (
            <ul className="space-y-2">
              {appointments?.map(a => (
                <li key={a.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{(a.patients as any)?.first_name} {(a.patients as any)?.last_name}</p>
                    <p className="text-sm text-slate-500">{(a.services as any)?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{new Date(a.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <span className="text-xs px-2 py-1 bg-sky-100 text-sky-800 rounded-full">{a.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
