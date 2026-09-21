import os

filepath = r"c:\Users\EQC0670\Medika\apps\web\src\modules\appointments\pages\AgendaPage.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports_to_add = """import { useNavigate } from 'react-router-dom';
import { consultationService } from '../../consultations/services/consultation.service';
"""
content = content.replace("import { Card, CardContent } from '@/components/ui/card';", "import { Card, CardContent } from '@/components/ui/card';\n" + imports_to_add)

# Add hooks inside AgendaPage
hooks_to_add = """  const navigate = useNavigate();
  
  const handleSelectEvent = async (event: any) => {
    if (event.status === 'cancelled') {
      alert('Esta cita está cancelada.');
      return;
    }
    
    if (confirm(`¿Deseas iniciar o continuar la atención para: ${event.title}?`)) {
      try {
        const consultation = await consultationService.getOrCreateDraft(event.id, organizationId!, event.patient_id, event.professional_id);
        navigate(`/workspace/${consultation.id}`);
      } catch (err) {
        console.error('Error al iniciar consulta:', err);
        alert('Hubo un error al iniciar la consulta.');
      }
    }
  };
"""

content = content.replace("const [currentDate, setCurrentDate] = useState(new Date());", "const [currentDate, setCurrentDate] = useState(new Date());\n" + hooks_to_add)

# Make sure patient_id and professional_id are passed in the events map
content = content.replace("id: a.id,", "id: a.id,\n      patient_id: a.patient_id,\n      professional_id: a.professional_id,")

# Add onSelectEvent prop to Calendar
content = content.replace("onNavigate={(date) => setCurrentDate(date)}", "onNavigate={(date) => setCurrentDate(date)}\n              onSelectEvent={handleSelectEvent}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
