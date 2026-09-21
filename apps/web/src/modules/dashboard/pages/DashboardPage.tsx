import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { billingService } from '../../billing/services/billing.service';

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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {profile?.first_name}</h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de la actividad en {profile?.organization?.name || 'tu consultorio'}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Ingresos Totales</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(metrics?.revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Facturas pagadas</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pacientes Registrados</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics?.patients || 0}</div>
            <p className="text-xs text-muted-foreground">En tu organización</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Citas Hoy</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics?.appointmentsToday || 0}</div>
            <p className="text-xs text-muted-foreground">Citas programadas para hoy</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Actividad</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">Activo</div>
            <p className="text-xs text-muted-foreground">Sistema operando correctamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
