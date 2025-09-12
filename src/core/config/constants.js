/**
 * Configuración global para la Calculadora IU con Simulador APV
 * Contiene constantes, configuraciones y mensajes de error del sistema
 */

/**
 * Configuración principal de la aplicación
 */
export const CONFIG = {
    // Prefijo para localStorage
    STORAGE_PREFIX: 'calc_iu_',
    
    // Límites de validación
    MIN_RENTA: 0,
    MAX_RENTA: 999999999,
    MIN_UTM: 1,
    MAX_UTM: 1000000,
    
    // Configuración regional
    LOCALE: 'es-CL',
    CURRENCY: 'CLP',
    TIMEZONE: 'America/Santiago',
    
    // Configuración de formateo
    DECIMAL_PLACES: 2,
    FACTOR_DECIMAL_PLACES: 4,
    THOUSAND_SEPARATOR: '.',
    DECIMAL_SEPARATOR: ',',
    
    // Configuración de fechas
    MIN_YEAR: 2020,
    MAX_YEAR: 2030,
    DEFAULT_YEAR: 2025,
    DEFAULT_MONTH: 1,
    
    // Configuración de la aplicación
    APP_NAME: 'Calculadora IU con Simulador APV',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Herramienta integral para cálculo de Impuesto Único y simulación de APV',
    
    // Configuración de API (si se implementa en el futuro)
    API_BASE_URL: '',
    API_TIMEOUT: 5000,
    
    // Configuración de caché
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    
    // Configuración de validación
    VALIDATION: {
        RENTA_MIN_LENGTH: 1,
        RENTA_MAX_LENGTH: 9,
        UTM_MIN_LENGTH: 1,
        UTM_MAX_LENGTH: 7,
        RUT_LENGTH: 9,
        EMAIL_MAX_LENGTH: 100
    }
};

/**
 * Mensajes de error del sistema
 */
export const ERRORS = {
    // Errores de datos
    DATA_NOT_FOUND: 'No se encontraron datos para el período seleccionado',
    INVALID_RENTA: 'El monto de renta ingresado no es válido',
    INVALID_UTM: 'El valor de UTM ingresado no es válido',
    UTM_ZERO: 'El valor de UTM no puede ser cero',
    INVALID_PERIOD: 'El período seleccionado no es válido',
    INVALID_RUT: 'El RUT ingresado no es válido',
    INVALID_EMAIL: 'El email ingresado no es válido',
    
    // Errores de cálculo
    CALCULATION_ERROR: 'Error en el cálculo. Verifique los datos ingresados',
    DIVISION_BY_ZERO: 'No se puede dividir por cero',
    OVERFLOW_ERROR: 'El resultado del cálculo es demasiado grande',
    
    // Errores de almacenamiento
    STORAGE_ERROR: 'Error al guardar los datos',
    STORAGE_FULL: 'No hay espacio suficiente para guardar los datos',
    STORAGE_NOT_SUPPORTED: 'El almacenamiento local no está soportado',
    
    // Errores de red
    NETWORK_ERROR: 'Error de conexión. Verifique su internet',
    TIMEOUT_ERROR: 'La operación tardó demasiado tiempo',
    SERVER_ERROR: 'Error del servidor. Intente más tarde',
    
    // Errores de validación
    REQUIRED_FIELD: 'Este campo es obligatorio',
    INVALID_FORMAT: 'El formato ingresado no es válido',
    OUT_OF_RANGE: 'El valor está fuera del rango permitido',
    INVALID_DATE: 'La fecha ingresada no es válida',
    
    // Errores generales
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
    PERMISSION_DENIED: 'No tiene permisos para realizar esta acción',
    FEATURE_NOT_AVAILABLE: 'Esta funcionalidad no está disponible'
};

/**
 * Mensajes de éxito del sistema
 */
export const SUCCESS = {
    DATA_SAVED: 'Datos guardados correctamente',
    CALCULATION_COMPLETE: 'Cálculo completado exitosamente',
    DATA_LOADED: 'Datos cargados correctamente',
    SETTINGS_UPDATED: 'Configuración actualizada correctamente',
    EXPORT_SUCCESS: 'Datos exportados correctamente',
    IMPORT_SUCCESS: 'Datos importados correctamente'
};

/**
 * Configuración de tramos de Impuesto Único por año
 * Estructura: { año: { tramos: [...], utm: valor } }
 */
export const TRAMOS_CONFIG = {
    2025: {
        utm: 0, // Se actualizará dinámicamente
        tramos: [
            { desde: 0, hasta: 13.5, factor: 0, rebaja: 0 },
            { desde: 13.5, hasta: 30, factor: 0.04, rebaja: 0.54 },
            { desde: 30, hasta: 50, factor: 0.08, rebaja: 1.74 },
            { desde: 50, hasta: 70, factor: 0.135, rebaja: 4.49 },
            { desde: 70, hasta: 90, factor: 0.23, rebaja: 11.14 },
            { desde: 90, hasta: 120, factor: 0.304, rebaja: 17.8 },
            { desde: 120, hasta: 150, factor: 0.35, rebaja: 23.32 },
            { desde: 150, hasta: Infinity, factor: 0.4, rebaja: 30.82 }
        ]
    }
};

/**
 * Configuración de APV
 */
export const APV_CONFIG = {
    // Límites anuales
    MAX_APV_ANUAL: 60, // UF
    MAX_APV_MENSUAL: 5, // UF
    
    // Límites de edad
    MIN_AGE: 18,
    MAX_AGE: 65,
    
    // Configuración de proyecciones
    DEFAULT_RETURN_RATE: 0.06, // 6% anual
    MIN_RETURN_RATE: 0.01, // 1% anual
    MAX_RETURN_RATE: 0.15, // 15% anual
    
    // Configuración de inflación
    DEFAULT_INFLATION_RATE: 0.03, // 3% anual
    MIN_INFLATION_RATE: 0.01, // 1% anual
    MAX_INFLATION_RATE: 0.10, // 10% anual
    
    // Configuración de comisiones
    DEFAULT_COMMISSION_RATE: 0.015, // 1.5% anual
    MIN_COMMISSION_RATE: 0.005, // 0.5% anual
    MAX_COMMISSION_RATE: 0.05, // 5% anual
};

/**
 * Configuración de UF/UTM
 */
export const UF_UTM_CONFIG = {
    // Fuentes de datos
    DATA_SOURCES: {
        SII: 'https://www.sii.cl/valores_y_fechas/uf/uf2025.htm',
        BANCO_CENTRAL: 'https://si3.bcentral.cl/Siete/ES/Siete/Cuadro/CAP_CCNN/MN_CAP_CCNN/UF_CCNN_2025'
    },
    
    // Configuración de actualización
    UPDATE_FREQUENCY: 24 * 60 * 60 * 1000, // 24 horas
    CACHE_KEY: 'uf_utm_data',
    
    // Valores por defecto (se actualizarán dinámicamente)
    DEFAULT_UF: 37000,
    DEFAULT_UTM: 65000
};

/**
 * Configuración de la interfaz de usuario
 */
export const UI_CONFIG = {
    // Configuración de pestañas
    TABS: {
        IU: 'iu',
        APV: 'apv',
        UF_UTM: 'ufutm'
    },
    
    // Configuración de animaciones
    ANIMATION_DURATION: 300,
    FADE_DURATION: 200,
    
    // Configuración de responsive
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024,
        DESKTOP: 1200
    },
    
    // Configuración de colores (para futuras personalizaciones)
    COLORS: {
        PRIMARY: '#667eea',
        SECONDARY: '#764ba2',
        SUCCESS: '#28a745',
        WARNING: '#ffc107',
        DANGER: '#dc3545',
        INFO: '#17a2b8'
    }
};

/**
 * Configuración de desarrollo
 */
export const DEV_CONFIG = {
    DEBUG: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    ENABLE_TESTS: true,
    MOCK_DATA: false
};

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - Constants');
    
    // Test CONFIG
    console.assert(CONFIG.STORAGE_PREFIX === 'calc_iu_', 'STORAGE_PREFIX should be "calc_iu_"');
    console.assert(CONFIG.MIN_RENTA === 0, 'MIN_RENTA should be 0');
    console.assert(CONFIG.MAX_RENTA === 999999999, 'MAX_RENTA should be 999999999');
    console.assert(CONFIG.LOCALE === 'es-CL', 'LOCALE should be "es-CL"');
    
    // Test ERRORS
    console.assert(typeof ERRORS.DATA_NOT_FOUND === 'string', 'ERRORS.DATA_NOT_FOUND should be a string');
    console.assert(ERRORS.DATA_NOT_FOUND.length > 0, 'ERRORS.DATA_NOT_FOUND should not be empty');
    
    // Test SUCCESS
    console.assert(typeof SUCCESS.DATA_SAVED === 'string', 'SUCCESS.DATA_SAVED should be a string');
    console.assert(SUCCESS.DATA_SAVED.length > 0, 'SUCCESS.DATA_SAVED should not be empty');
    
    // Test TRAMOS_CONFIG
    console.assert(TRAMOS_CONFIG[2025], 'TRAMOS_CONFIG should have 2025 configuration');
    console.assert(Array.isArray(TRAMOS_CONFIG[2025].tramos), 'TRAMOS_CONFIG[2025].tramos should be an array');
    console.assert(TRAMOS_CONFIG[2025].tramos.length > 0, 'TRAMOS_CONFIG[2025].tramos should not be empty');
    
    // Test APV_CONFIG
    console.assert(APV_CONFIG.MAX_APV_ANUAL === 60, 'APV_CONFIG.MAX_APV_ANUAL should be 60');
    console.assert(APV_CONFIG.DEFAULT_RETURN_RATE === 0.06, 'APV_CONFIG.DEFAULT_RETURN_RATE should be 0.06');
    
    console.log('✅ Todos los tests de constants pasaron correctamente');
    console.groupEnd();
}
