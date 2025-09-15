/**
 * Módulo de validación de datos para la Calculadora IU con Simulador APV
 * Contiene funciones para validar rentas, UTM, períodos y otros datos de entrada
 */

import { CONFIG } from '../config/constants.js';

/**
 * Valida que el valor de renta sea un número válido dentro del rango permitido
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es válido, false en caso contrario
 * @example
 * isValidRenta(500000) // true
 * isValidRenta(0) // false
 * isValidRenta(1000000000) // false
 */
export function isValidRenta(value) {
    if (value === null || value === undefined || value === '') {
        return false;
    }
    
    const num = Number(value);
    
    if (isNaN(num)) {
        return false;
    }
    
    return num > CONFIG.MIN_RENTA && num <= CONFIG.MAX_RENTA;
}

/**
 * Valida que el valor de UTM sea un número positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es válido, false en caso contrario
 * @example
 * isValidUTM(50000) // true
 * isValidUTM(0) // false
 * isValidUTM(-1000) // false
 */
export function isValidUTM(value) {
    if (value === null || value === undefined || value === '') {
        return false;
    }
    
    const num = Number(value);
    
    if (isNaN(num)) {
        return false;
    }
    
    return num >= CONFIG.MIN_UTM;
}

/**
 * Valida que el año y mes formen un período válido
 * @param {number} year - Año a validar
 * @param {number} month - Mes a validar (1-12)
 * @returns {boolean} true si es válido, false en caso contrario
 * @example
 * isValidPeriod(2025, 1) // true
 * isValidPeriod(2019, 12) // false (año muy antiguo)
 * isValidPeriod(2025, 13) // false (mes inválido)
 */
export function isValidPeriod(year, month) {
    if (year === null || year === undefined || month === null || month === undefined) {
        return false;
    }
    
    const yearNum = Number(year);
    const monthNum = Number(month);
    
    if (isNaN(yearNum) || isNaN(monthNum)) {
        return false;
    }
    
    // Validar año (desde 2020 en adelante)
    if (yearNum < 2020 || yearNum > 2030) {
        return false;
    }
    
    // Validar mes (1-12)
    if (monthNum < 1 || monthNum > 12) {
        return false;
    }
    
    return true;
}

/**
 * Valida que un string no esté vacío y tenga contenido válido
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es válido, false en caso contrario
 * @example
 * isValidString("texto") // true
 * isValidString("") // false
 * isValidString(null) // false
 */
export function isValidString(value) {
    return value !== null && 
           value !== undefined && 
           typeof value === 'string' && 
           value.trim().length > 0;
}

/**
 * Valida que un número sea entero positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es válido, false en caso contrario
 * @example
 * isValidPositiveInteger(5) // true
 * isValidPositiveInteger(0) // false
 * isValidPositiveInteger(-1) // false
 * isValidPositiveInteger(5.5) // false
 */
export function isValidPositiveInteger(value) {
    if (value === null || value === undefined || value === '') {
        return false;
    }
    
    const num = Number(value);
    
    if (isNaN(num)) {
        return false;
    }
    
    return Number.isInteger(num) && num > 0;
}

/**
 * Valida que un valor esté dentro de un rango específico
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo (inclusive)
 * @param {number} max - Valor máximo (inclusive)
 * @returns {boolean} true si está en el rango, false en caso contrario
 * @example
 * isInRange(5, 1, 10) // true
 * isInRange(0, 1, 10) // false
 * isInRange(15, 1, 10) // false
 */
export function isInRange(value, min, max) {
    if (value === null || value === undefined) {
        return false;
    }
    
    const num = Number(value);
    
    if (isNaN(num)) {
        return false;
    }
    
    return num >= min && num <= max;
}

/**
 * Valida que un email tenga formato válido
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido, false en caso contrario
 * @example
 * isValidEmail("test@example.com") // true
 * isValidEmail("invalid-email") // false
 */
export function isValidEmail(email) {
    if (!isValidString(email)) {
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Valida que un RUT chileno tenga formato válido
 * @param {string} rut - RUT a validar (con o sin puntos y guión)
 * @returns {boolean} true si es válido, false en caso contrario
 * @example
 * isValidRUT("12345678-9") // true
 * isValidRUT("12.345.678-9") // true
 * isValidRUT("12345678-0") // false (dígito verificador incorrecto)
 */
export function isValidRUT(rut) {
    if (!rut || typeof rut !== 'string') return false;
    
    // Limpiar RUT
    const cleanRUT = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    if (cleanRUT.length < 2) return false;
    
    const rutNumber = cleanRUT.slice(0, -1);
    const dv = cleanRUT.slice(-1);
    
    if (!/^\d+$/.test(rutNumber)) return false;
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutNumber.length - 1; i >= 0; i--) {
        suma += parseInt(rutNumber[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : String(11 - resto);
    
    return dv === dvCalculado;
}

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - Validators');
    
    // Test isValidRenta
    console.assert(isValidRenta(500000) === true, 'isValidRenta(500000) should return true');
    console.assert(isValidRenta(0) === false, 'isValidRenta(0) should return false');
    console.assert(isValidRenta(1000000000) === false, 'isValidRenta(1000000000) should return false');
    console.assert(isValidRenta(null) === false, 'isValidRenta(null) should return false');
    
    // Test isValidUTM
    console.assert(isValidUTM(50000) === true, 'isValidUTM(50000) should return true');
    console.assert(isValidUTM(0) === false, 'isValidUTM(0) should return false');
    console.assert(isValidUTM(-1000) === false, 'isValidUTM(-1000) should return false');
    
    // Test isValidPeriod
    console.assert(isValidPeriod(2025, 1) === true, 'isValidPeriod(2025, 1) should return true');
    console.assert(isValidPeriod(2019, 12) === false, 'isValidPeriod(2019, 12) should return false');
    console.assert(isValidPeriod(2025, 13) === false, 'isValidPeriod(2025, 13) should return false');
    
    // Test isValidString
    console.assert(isValidString("texto") === true, 'isValidString("texto") should return true');
    console.assert(isValidString("") === false, 'isValidString("") should return false');
    console.assert(isValidString(null) === false, 'isValidString(null) should return false');
    
    // Test isValidPositiveInteger
    console.assert(isValidPositiveInteger(5) === true, 'isValidPositiveInteger(5) should return true');
    console.assert(isValidPositiveInteger(0) === false, 'isValidPositiveInteger(0) should return false');
    console.assert(isValidPositiveInteger(5.5) === false, 'isValidPositiveInteger(5.5) should return false');
    
    // Test isInRange
    console.assert(isInRange(5, 1, 10) === true, 'isInRange(5, 1, 10) should return true');
    console.assert(isInRange(0, 1, 10) === false, 'isInRange(0, 1, 10) should return false');
    
    // Test isValidEmail
    console.assert(isValidEmail("test@example.com") === true, 'isValidEmail("test@example.com") should return true');
    console.assert(isValidEmail("invalid-email") === false, 'isValidEmail("invalid-email") should return false');
    
    // Test isValidRUT
    console.assert(isValidRUT("11.111.111-1") === true, 'isValidRUT("11.111.111-1") should return true');
    console.assert(isValidRUT("12.345.678-5") === true, 'isValidRUT("12.345.678-5") should return true');
    console.assert(isValidRUT("76.086.428-5") === true, 'isValidRUT("76.086.428-5") should return true');
    console.assert(isValidRUT("12345678-0") === false, 'isValidRUT("12345678-0") should return false');
    
    console.log('✅ Todos los tests de validators pasaron correctamente');
    console.groupEnd();
}
