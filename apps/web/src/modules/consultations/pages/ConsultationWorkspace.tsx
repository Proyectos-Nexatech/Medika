import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationService, Consultation } from '../services/consultation.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PrescriptionTemplate } from '../components/PrescriptionTemplate';

export function ConsultationWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: consultation, isLoading } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => consultationService.getConsultationById(id!),
    enabled: !!id,
  });

  const [formData, setFormData] = useState<Partial<Consultation>>({});
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'>('idle');

  useEffect(() => {
    if (consultation) {
      setFormData({
        reason: consultation.reason || '',
        current_illness: consultation.current_illness || '',
        vital_signs: consultation.vital_signs || { blood_pressure: '', heart_rate: '', respiratory_rate: '', temperature: '', weight: '', height: '' },
        physical_exam: consultation.physical_exam || '',
        findings: consultation.findings || '',
        treatment_plan: consultation.treatment_plan || '',
        recommendations: consultation.recommendations || '',
        status: consultation.status
      });
    }
  }, [consultation]);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Consultation>) => consultationService.updateConsultation(id!, updates),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      queryClient.invalidateQueries({ queryKey: ['consultation', id] });
    }
  });

  const handleChange = (field: keyof Consultation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalSignChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vital_signs: { ...(prev.vital_signs as object || {}), [field]: value }
    }));
  };

  const handleSaveDraft = () => {
    updateMutation.mutate(formData);
  };

  const handleFinish = () => {
    if (confirm('¿Estás seguro de finalizar la consulta? Ya no podrás editarla.')) {
      updateMutation.mutate({ ...formData, status: 'completed' }, {
        onSuccess: () => navigate('/consultations')
      });
    }
  };

  if (isLoading || !consultation) return <div className="p-8">Cargando Workspace Clínico...</div>;

  const patient = consultation.patients as any;
  const isReadonly = formData.status === 'completed' || formData.status === 'signed';

  return (
    <>
    <PrescriptionTemplate consultation={consultation as any} />
    <div className="space-y-4 max-w-5xl mx-auto pb-12 print:hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-medika-900">{patient?.first_name} {patient?.last_name}</h1>
          <p className="text-sm text-slate-500">{patient?.document_type} {patient?.document_number} | Edad: N/A | Sexo: {patient?.sex}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            {saveStatus === 'saving' && 'Guardando...'}
            {saveStatus === 'saved' && 'Guardado ✔'}
          </span>
          {!isReadonly && (
            <>
              <button onClick={handleSaveDraft} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-medium text-sm transition-colors">
                Guardar Borrador
              </button>
              <button onClick={handleFinish} className="px-4 py-2 bg-medika-600 text-white hover:bg-medika-700 rounded-md font-medium text-sm shadow-sm transition-colors">
                Finalizar Consulta
              </button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md font-medium text-sm shadow-sm transition-colors print:hidden">
                🖨️ Imprimir Receta
              </button>
            </>
          )}
          {isReadonly && (
            <>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md font-medium text-sm">
                Consulta Finalizada
              </span>
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md font-medium text-sm shadow-sm transition-colors print:hidden">
                🖨️ Imprimir Receta
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMNA PRINCIPAL */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-lg">Anamnesis</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Motivo de Consulta</label>
                <textarea disabled={isReadonly} rows={3} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-medika-500 focus:border-medika-500" value={formData.reason || ''} onChange={(e) => handleChange('reason', e.target.value)} placeholder="¿Por qué acude el paciente?" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Enfermedad Actual</label>
                <textarea disabled={isReadonly} rows={4} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-medika-500 focus:border-medika-500" value={formData.current_illness || ''} onChange={(e) => handleChange('current_illness', e.target.value)} placeholder="Detalle de los síntomas..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-lg">Examen Físico y Hallazgos</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Examen Físico General</label>
                <textarea disabled={isReadonly} rows={3} className="w-full border rounded-md p-2 text-sm" value={formData.physical_exam || ''} onChange={(e) => handleChange('physical_exam', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Hallazgos Específicos</label>
                <textarea disabled={isReadonly} rows={2} className="w-full border rounded-md p-2 text-sm" value={formData.findings || ''} onChange={(e) => handleChange('findings', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-lg">Diagnóstico y Plan</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Plan de Tratamiento</label>
                <textarea disabled={isReadonly} rows={4} className="w-full border rounded-md p-2 text-sm" value={formData.treatment_plan || ''} onChange={(e) => handleChange('treatment_plan', e.target.value)} placeholder="Medicamentos, terapias, etc." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Recomendaciones (visibles para el paciente)</label>
                <textarea disabled={isReadonly} rows={3} className="w-full border rounded-md p-2 text-sm" value={formData.recommendations || ''} onChange={(e) => handleChange('recommendations', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA LATERAL */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-sky-50 border-b border-sky-100 pb-4"><CardTitle className="text-lg text-sky-900">Signos Vitales</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-4 bg-white">
              {['blood_pressure', 'heart_rate', 'respiratory_rate', 'temperature', 'weight', 'height'].map(vs => (
                <div key={vs}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 capitalize">{vs.replace('_', ' ')}</label>
                  <input 
                    disabled={isReadonly}
                    type="text" 
                    className="w-full border rounded-md p-2 text-sm bg-slate-50 focus:bg-white" 
                    value={(formData.vital_signs as any)?.[vs] || ''} 
                    onChange={(e) => handleVitalSignChange(vs, e.target.value)} 
                    placeholder="Ej. 120/80" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
