import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { billingService } from '../../billing/services/billing.service';
import { DollarSign, Users, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  const { user } = useAuth();
  const { profile, organizationId } = useOrganization();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard_metrics', organizationId],
    queryFn: () => billingService.getDashboardMetrics(organizationId!),
    enabled: !!organizationId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[24px] font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Hello, {profile?.first_name || 'Dr.'} 👋
        </h1>
        <p className="text-[13px] font-medium text-slate-500">
          Aquí tienes un resumen de la actividad en {profile?.organization?.name || 'tu consultorio'} para hoy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex flex-row items-center justify-between z-10">
            <h3 className="text-[12.5px] font-bold text-slate-500">Ingresos Totales</h3>
            <div className="h-7 w-7 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5 z-10">
            <div className="text-[24px] font-extrabold text-slate-800">{isLoading ? '...' : formatCurrency(metrics?.revenue || 0)}</div>
            <p className="text-[11.5px] font-semibold text-slate-400">Facturas pagadas</p>
          </div>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-gradient-to-br from-green-50 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Card 2 */}
        <div className="rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex flex-row items-center justify-between z-10">
            <h3 className="text-[12.5px] font-bold text-slate-500">Pacientes</h3>
            <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5 z-10">
            <div className="text-[24px] font-extrabold text-slate-800">{isLoading ? '...' : metrics?.patients || 0}</div>
            <p className="text-[11.5px] font-semibold text-slate-400">Total registrados</p>
          </div>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Card 3 */}
        <div className="rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="flex flex-row items-center justify-between z-10">
            <h3 className="text-[12.5px] font-bold text-slate-500">Citas Hoy</h3>
            <div className="h-7 w-7 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
              <Calendar className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5 z-10">
            <div className="text-[24px] font-extrabold text-slate-800">{isLoading ? '...' : metrics?.appointmentsToday || 0}</div>
            <p className="text-[11.5px] font-semibold text-slate-400">Programadas para hoy</p>
          </div>
          <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-gradient-to-br from-purple-50 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Card 4 */}
        <div className="rounded-[24px] bg-medika-600 shadow-[0_8px_30px_rgba(37,99,235,0.2)] p-5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all text-white">
          <div className="flex flex-row items-center justify-between z-10">
            <h3 className="text-[12.5px] font-bold text-white/80">Actividad del Sistema</h3>
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 z-10">
            <div className="text-[24px] font-extrabold">100%</div>
            <p className="text-[11.5px] font-semibold text-white/70">Operando correctamente</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-0 right-0 h-12 w-12 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Mock Section: Próxima cita */}
        <div className="col-span-1 bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
          <h3 className="text-[15px] font-extrabold text-slate-800">Próxima Cita</h3>
          <div className="flex items-center gap-3 bg-slate-50 rounded-[16px] p-3 border border-slate-100/50">
            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Patient" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">María González</p>
              <p className="text-[11px] font-semibold text-slate-500">Cardiología • Hoy, 2:00 PM</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-auto">
            <Button className="w-full rounded-[12px] bg-medika-600 hover:bg-medika-700 h-9 font-semibold text-[13px] shadow-sm shadow-medika-200/50">
              Iniciar Consulta
            </Button>
            <Button variant="outline" className="w-full rounded-[12px] h-9 font-semibold text-[13px] text-slate-600 border-slate-200 hover:bg-slate-50">
              Reprogramar
            </Button>
          </div>
        </div>

        {/* Mock Section: Resumen de salud / Actividad */}
        <div className="col-span-2 bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-extrabold text-slate-800">Resumen de Consultas</h3>
            <Button variant="ghost" className="text-medika-600 hover:bg-medika-50 font-bold text-[12px] rounded-[10px] h-7 px-2.5">
              Ver todo <span className="ml-1">→</span>
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[20px] bg-slate-50/50 min-h-[140px]">
            <div className="text-center">
              <svg className="h-8 w-8 text-slate-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <p className="text-[13px] font-bold text-slate-600">No hay datos suficientes</p>
              <p className="text-[11px] font-medium text-slate-400 mt-1">El gráfico aparecerá cuando registres más consultas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}