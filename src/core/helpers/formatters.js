/**
 * Módulo de formateo de datos para la Calculadora IU con Simulador APV
 * Contiene funciones para formatear números, monedas y porcentajes
 */

/**
 * Formatea un número a pesos chilenos con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado como moneda chilena
 * @example
 * fmtCLP(2500000) // "$2.500.000"
 * fmtCLP(0) // "$0"
 */
export function fmtCLP(number) {
    if (number === null || number === undefined || isNaN(number)) {
        return '$0';
    }
    
    const num = Number(number);
    if (num === 0) return '$0';
    
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

/**
 * Convierte un string de pesos chilenos a número
 * @param {string} clpString - String con formato de moneda chilena
 * @returns {number} Número extraído del string
 * @example
 * parseCLP("$2.500.000") // 2500000
 * parseCLP("$1.000") // 1000
 */
export function parseCLP(clpString) {
    if (!clpString || typeof clpString !== 'string') {
        return 0;
    }
    
    // Remover símbolos de moneda, puntos y espacios
    const cleanString = clpString
        .replace(/[$\.\s]/g, '')
        .replace(/,/g, '.');
    
    const number = parseFloat(cleanString);
    return isNaN(number) ? 0 : Math.round(number);
}

/**
 * Formatea un factor con 4 decimales
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado con 4 decimales
 * @example
 * fmtFactor(0.135) // "0.1350"
 * fmtFactor(1.5) // "1.5000"
 */
export function fmtFactor(number) {
    if (number === null || number === undefined || isNaN(number)) {
        return '0.0000';
    }
    
    const num = Number(number);
    return num.toFixed(4);
}

/**
 * Formatea un número como porcentaje con 2 decimales
 * @param {number} number - Número a formatear (0.135 = 13.5%)
 * @returns {string} Número formateado como porcentaje
 * @example
 * fmtPercentage(0.135) // "13.50%"
 * fmtPercentage(0.5) // "50.00%"
 */
export function fmtPercentage(number) {
    if (number === null || number === undefined || isNaN(number)) {
        return '0.00%';
    }
    
    const num = Number(number);
    const percentage = num * 100;
    
    return new Intl.NumberFormat('es-CL', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(percentage / 100);
}

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado con separadores
 * @example
 * fmtNumber(2500000) // "2.500.000"
 * fmtNumber(1000) // "1.000"
 */
export function fmtNumber(number) {
    if (number === null || number === undefined || isNaN(number)) {
        return '0';
    }
    
    const num = Number(number);
    return new Intl.NumberFormat('es-CL').format(num);
}

/**
 * Formatea un número como UF con 2 decimales
 * @param {number} number - Número a formatear
 * @param {boolean} withSuffix - Si incluir el sufijo "UF" (default: true)
 * @returns {string} Número formateado como UF
 * @example
 * fmtUF(2500.5) // "2.500,50 UF"
 * fmtUF(2500.5, false) // "$2.500,50"
 * fmtUF(100) // "100,00 UF"
 */
export function fmtUF(number, withSuffix = true) {
    if (number === null || number === undefined || isNaN(number)) {
        return withSuffix ? '0,00 UF' : '$0,00';
    }
    
    const num = Number(number);
    const formatted = new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
    
    return withSuffix ? `${formatted} UF` : `$${formatted}`;
}

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - Formatters');
    
    // Test fmtCLP
    console.assert(fmtCLP(2500000) === '$2.500.000', 'fmtCLP(2500000) should return "$2.500.000"');
    console.assert(fmtCLP(0) === '$0', 'fmtCLP(0) should return "$0"');
    console.assert(fmtCLP(null) === '$0', 'fmtCLP(null) should return "$0"');
    
    // Test parseCLP
    console.assert(parseCLP('$2.500.000') === 2500000, 'parseCLP("$2.500.000") should return 2500000');
    console.assert(parseCLP('$1.000') === 1000, 'parseCLP("$1.000") should return 1000');
    console.assert(parseCLP('') === 0, 'parseCLP("") should return 0');
    
    // Test fmtFactor
    console.assert(fmtFactor(0.135) === '0.1350', 'fmtFactor(0.135) should return "0.1350"');
    console.assert(fmtFactor(1.5) === '1.5000', 'fmtFactor(1.5) should return "1.5000"');
    
    // Test fmtPercentage
    console.assert(fmtPercentage(0.135) === '13,50%', 'fmtPercentage(0.135) should return "13,50%"');
    console.assert(fmtPercentage(0.5) === '50,00%', 'fmtPercentage(0.5) should return "50,00%"');
    
    // Test fmtNumber
    console.assert(fmtNumber(2500000) === '2.500.000', 'fmtNumber(2500000) should return "2.500.000"');
    
    // Test fmtUF
    console.assert(fmtUF(2500.5) === '2.500,50 UF', 'fmtUF(2500.5) should return "2.500,50 UF"');
    
    console.log('✅ Todos los tests de formatters pasaron correctamente');
    console.groupEnd();
}
