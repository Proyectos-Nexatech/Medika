/**
 * Utilidades de formato para Medika
 */
/**
 * Formatea un nombre completo
 */
export const formatFullName = (firstName, lastName) => {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
};
/**
 * Formatea un número de teléfono colombiano
 */
export const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return phone;
};
/**
 * Formatea un valor monetario en pesos colombianos
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
/**
 * Etiquetas para tipos de documento de identidad colombianos
 */
export const DOCUMENT_TYPE_LABELS = {
    CC: 'Cédula de Ciudadanía',
    CE: 'Cédula de Extranjería',
    PA: 'Pasaporte',
    RC: 'Registro Civil',
    TI: 'Tarjeta de Identidad',
    NIT: 'NIT',
    AS: 'Adulto sin identificación',
    MS: 'Menor sin identificación',
};
/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};
/**
 * Trunca un texto a un número máximo de caracteres
 */
export const truncate = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, maxLength)}...`;
};
/**
 * Obtiene las iniciales de un nombre
 */
export const getInitials = (name) => {
    return name
        .split(' ')
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
};
//# sourceMappingURL=format.js.map