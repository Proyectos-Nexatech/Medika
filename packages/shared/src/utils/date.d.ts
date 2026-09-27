/**
 * Utilidades de fecha y hora para Medika
 * Zona horaria: Colombia (America/Bogota, UTC-5)
 */
export declare const TZ_COLOMBIA = "America/Bogota";
/**
 * Formatea una fecha en formato legible en español
 */
export declare const formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
/**
 * Formatea una hora en formato HH:MM
 */
export declare const formatTime: (time: string) => string;
/**
 * Formatea una fecha y hora combinadas
 */
export declare const formatDateTime: (date: string | Date) => string;
/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD
 */
export declare const today: () => string;
/**
 * Verifica si una fecha es hoy
 */
export declare const isToday: (date: string) => boolean;
/**
 * Retorna el nombre del mes en español
 */
export declare const getMonthName: (month: number) => string;
/**
 * Retorna el nombre del día de la semana en español
 */
export declare const getDayName: (date: string | Date) => string;
//# sourceMappingURL=date.d.ts.map