import os

base_dir = r"c:\Users\EQC0670\Medika\apps\web\src\modules\consultations"

prescription_code = """import React from 'react';
import { useOrganization } from '@/context/OrganizationContext';
import { Consultation } from '../services/consultation.service';

interface PrescriptionTemplateProps {
  consultation: Consultation;
}

export const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({ consultation }) => {
  const { profile } = useOrganization();
  const patient = consultation.patients as any;
  const professional = consultation.professionals as any;

  return (
    <div className="hidden print:block p-8 bg-white text-black min-h-screen">
      {/* Cabecera */}
      <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase">{profile?.organization?.name || 'Nexatech Salud'}</h1>
          <p className="text-sm">{profile?.organization?.commercialName || 'Consultorio Médico'}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold text-lg">Dr. {professional?.first_name} {professional?.last_name}</p>
          <p>Licencia: {professional?.registration_number || 'N/A'}</p>
          <p>{professional?.specialty}</p>
        </div>
      </div>

      {/* Datos del Paciente */}
      <div className="mb-8 grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg print:bg-transparent print:border print:border-slate-300">
        <div>
          <p><span className="font-bold">Paciente:</span> {patient?.first_name} {patient?.last_name}</p>
          <p><span className="font-bold">Documento:</span> {patient?.document_type} {patient?.document_number}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">Fecha:</span> {new Date(consultation.created_at).toLocaleDateString()}</p>
          <p><span className="font-bold">ID Consulta:</span> {consultation.id.split('-')[0]}</p>
        </div>
      </div>

      {/* Cuerpo de la Receta */}
      <div className="min-h-[400px]">
        <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">RECETA MÉDICA / PLAN DE TRATAMIENTO</h2>
        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {consultation.treatment_plan || 'Sin plan de tratamiento especificado.'}
        </div>
        
        {consultation.recommendations && (
          <div className="mt-8">
            <h3 className="font-bold text-md mb-2">Recomendaciones Adicionales:</h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {consultation.recommendations}
            </div>
          </div>
        )}
      </div>

      {/* Firmas */}
      <div className="mt-16 pt-16 flex justify-center border-t border-slate-300 w-64 mx-auto">
        <div className="text-center">
          <p className="font-bold">Firma del Profesional</p>
          <p className="text-xs mt-1">Dr. {professional?.first_name} {professional?.last_name}</p>
        </div>
      </div>
      
      {/* Pie de página */}
      <div className="fixed bottom-0 left-0 w-full text-center text-xs text-slate-500 pb-4">
        Documento generado electrónicamente por Medika Platform
      </div>
    </div>
  );
};
"""

workspace_path = os.path.join(base_dir, "pages", "ConsultationWorkspace.tsx")
with open(workspace_path, 'r', encoding='utf-8') as f:
    workspace_content = f.read()

# Add import
workspace_content = workspace_content.replace(
    "import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';",
    "import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';\nimport { PrescriptionTemplate } from '../components/PrescriptionTemplate';"
)

# Add Print Button next to Finish Button
workspace_content = workspace_content.replace(
    """<button onClick={handleFinish} className="px-4 py-2 bg-medika-600 text-white hover:bg-medika-700 rounded-md font-medium text-sm shadow-sm transition-colors">
                Finalizar Consulta
              </button>""",
    """<button onClick={handleFinish} className="px-4 py-2 bg-medika-600 text-white hover:bg-medika-700 rounded-md font-medium text-sm shadow-sm transition-colors">
                Finalizar Consulta
              </button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md font-medium text-sm shadow-sm transition-colors print:hidden">
                🖨️ Imprimir Receta
              </button>"""
)

# Add Print Button for read-only view
workspace_content = workspace_content.replace(
    """<span className="px-4 py-2 bg-green-100 text-green-800 rounded-md font-medium text-sm">
              Consulta Finalizada
            </span>""",
    """<span className="px-4 py-2 bg-green-100 text-green-800 rounded-md font-medium text-sm">
              Consulta Finalizada
            </span>
            <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md font-medium text-sm shadow-sm transition-colors print:hidden">
              🖨️ Imprimir Receta
            </button>"""
)

# Add hide on print to the main container, and render the prescription
workspace_content = workspace_content.replace(
    """<div className="space-y-4 max-w-5xl mx-auto pb-12">""",
    """<>
    <PrescriptionTemplate consultation={consultation as any} />
    <div className="space-y-4 max-w-5xl mx-auto pb-12 print:hidden">"""
)

workspace_content = workspace_content.replace(
    """    </div>
  );""",
    """    </div>
    </>
  );"""
)

os.makedirs(os.path.join(base_dir, "components"), exist_ok=True)
with open(os.path.join(base_dir, "components", "PrescriptionTemplate.tsx"), 'w', encoding='utf-8') as f:
    f.write(prescription_code)

with open(workspace_path, 'w', encoding='utf-8') as f:
    f.write(workspace_content)

