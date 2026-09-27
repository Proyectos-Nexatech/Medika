/**
 * Utilidades de fecha y hora para Medika
 * Zona horaria: Colombia (America/Bogota, UTC-5)
 */
export const TZ_COLOMBIA = 'America/Bogota';
/**
 * Formatea una fecha en formato legible en español
 */
export const formatDate = (date, options) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-CO', {
        timeZone: TZ_COLOMBIA,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options,
    }).format(d);
};
/**
 * Formatea una hora en formato HH:MM
 */
export const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};
/**
 * Formatea una fecha y hora combinadas
 */
export const formatDateTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-CO', {
        timeZone: TZ_COLOMBIA,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
};
/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD
 */
export const today = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: TZ_COLOMBIA });
};
/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date) => {
    return date === today();
};
/**
 * Retorna el nombre del mes en español
 */
export const getMonthName = (month) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return months[month];
};
/**
 * Retorna el nombre del día de la semana en español
 */
export const getDayName = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-CO', { weekday: 'long', timeZone: TZ_COLOMBIA }).format(d);
};
//# sourceMappingURL=date.js.map