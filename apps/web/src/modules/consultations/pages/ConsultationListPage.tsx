import { useQuery } from '@tanstack/react-query';
import { consultationService } from '../services/consultation.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function ConsultationListPage() {
  const { organizationId } = useOrganization();
  const navigate = useNavigate();

  const { data: consultations, isLoading } = useQuery({
    queryKey: ['consultations', organizationId],
    queryFn: () => consultationService.getConsultations(organizationId!),
    enabled: !!organizationId,
  });

  if (isLoading) return <div>Cargando historial de consultas...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Historial Clínico</h1>
      <Card>
        <CardHeader><CardTitle>Consultas Realizadas</CardTitle></CardHeader>
        <CardContent>
          {consultations?.length === 0 ? <p>No hay consultas registradas en esta organización.</p> : (
            <ul className="space-y-2">
              {consultations?.map((c: any) => (
                <li key={c.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/workspace/${c.id}`)}>
                  <div>
                    <p className="font-semibold text-lg text-medika-700">{c.patients?.first_name} {c.patients?.last_name}</p>
                    <p className="text-sm text-slate-500">Doc: {c.patients?.document_number} | Atendido por: Dr. {c.professionals?.first_name} {c.professionals?.last_name}</p>
                    <p className="text-xs text-slate-400 mt-1">Motivo: {c.reason || 'Sin motivo especificado'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${c.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {c.status === 'draft' ? 'Borrador / En curso' : 'Completada'}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
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
