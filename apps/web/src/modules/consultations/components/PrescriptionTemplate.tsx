import React from 'react';
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
