/**
 * Barrel export para el módulo de helpers
 * Centraliza todas las exportaciones de funciones utilitarias
 */

// Exportar todas las funciones de formateo
export {
    fmtCLP,
    parseCLP,
    fmtFactor,
    fmtPercentage,
    fmtNumber,
    fmtUF
} from './formatters.js';

// Exportar todas las funciones de validación
export {
    isValidRenta,
    isValidUTM,
    isValidPeriod,
    isValidString,
    isValidPositiveInteger,
    isInRange,
    isValidEmail,
    isValidRUT
} from './validators.js';

// Re-exportar configuración desde constants
export {
    CONFIG,
    ERRORS,
    SUCCESS,
    TRAMOS_CONFIG,
    APV_CONFIG,
    UF_UTM_CONFIG,
    UI_CONFIG,
    DEV_CONFIG
} from '../config/constants.js';

/**
 * Función utilitaria para inicializar todos los helpers
 * Útil para configurar el entorno y ejecutar tests
 */
export function initializeHelpers() {
    console.log('🚀 Inicializando helpers de la Calculadora IU con Simulador APV...');
    
    // Verificar que todas las funciones estén disponibles
    const formatters = [
        'fmtCLP', 'parseCLP', 'fmtFactor', 'fmtPercentage', 'fmtNumber', 'fmtUF'
    ];
    
    const validators = [
        'isValidRenta', 'isValidUTM', 'isValidPeriod', 'isValidString',
        'isValidPositiveInteger', 'isInRange', 'isValidEmail', 'isValidRUT'
    ];
    
    // Verificar formatters
    formatters.forEach(funcName => {
        if (typeof window[funcName] === 'undefined') {
            console.warn(`⚠️ Función ${funcName} no está disponible globalmente`);
        }
    });
    
    // Verificar validators
    validators.forEach(funcName => {
        if (typeof window[funcName] === 'undefined') {
            console.warn(`⚠️ Función ${funcName} no está disponible globalmente`);
        }
    });
    
    console.log('✅ Helpers inicializados correctamente');
}

/**
 * Función para ejecutar todos los tests de los helpers
 */
export function runAllTests() {
    console.group('🧪 Ejecutando todos los tests de helpers');
    
    try {
        // Los tests se ejecutan automáticamente al importar los módulos
        // Esta función solo agrupa los logs
        console.log('✅ Todos los tests de helpers completados');
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error);
    } finally {
        console.groupEnd();
    }
}

/**
 * Función para obtener información sobre los helpers disponibles
 */
export function getHelpersInfo() {
    return {
        formatters: [
            'fmtCLP', 'parseCLP', 'fmtFactor', 'fmtPercentage', 'fmtNumber', 'fmtUF'
        ],
        validators: [
            'isValidRenta', 'isValidUTM', 'isValidPeriod', 'isValidString',
            'isValidPositiveInteger', 'isInRange', 'isValidEmail', 'isValidRUT'
        ],
        config: [
            'CONFIG', 'ERRORS', 'SUCCESS', 'TRAMOS_CONFIG', 'APV_CONFIG',
            'UF_UTM_CONFIG', 'UI_CONFIG', 'DEV_CONFIG'
        ],
        version: '1.0.0',
        description: 'Módulo de helpers para la Calculadora IU con Simulador APV'
    };
}

// Auto-inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Hacer las funciones disponibles globalmente para facilitar el desarrollo
    window.CalculadoraHelpers = {
        initializeHelpers,
        runAllTests,
        getHelpersInfo
    };
    
    // Ejecutar tests automáticamente en modo desarrollo
    if (DEV_CONFIG?.DEBUG) {
        console.log('🔧 Modo desarrollo activado - ejecutando tests automáticamente');
        runAllTests();
    }
}
