/**
 * Utilidades de formato para Medika
 */
import type { DocumentTypeColombia } from '../types/domain';
/**
 * Formatea un nombre completo
 */
export declare const formatFullName: (firstName: string, lastName: string) => string;
/**
 * Formatea un número de teléfono colombiano
 */
export declare const formatPhone: (phone: string) => string;
/**
 * Formatea un valor monetario en pesos colombianos
 */
export declare const formatCurrency: (amount: number) => string;
/**
 * Etiquetas para tipos de documento de identidad colombianos
 */
export declare const DOCUMENT_TYPE_LABELS: Record<DocumentTypeColombia, string>;
/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export declare const calculateAge: (birthDate: string) => number;
/**
 * Trunca un texto a un número máximo de caracteres
 */
export declare const truncate: (text: string, maxLength: number) => string;
/**
 * Obtiene las iniciales de un nombre
 */
export declare const getInitials: (name: string) => string;
//# sourceMappingURL=format.d.ts.map