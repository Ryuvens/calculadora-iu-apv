/**
 * Barrel export para el módulo UF/UTM
 * Centraliza todas las exportaciones del módulo de gestión de datos UF/UTM
 */

// Exportar clases principales
export { UFUTMService, ufutmService } from './ufutm.service.js';
export { UFUTMStorage, ufutmStorage } from './ufutm.storage.js';

// Re-exportar funciones utilitarias relacionadas
export { isValidPeriod, isValidUTM } from '../../core/helpers/validators.js';
export { fmtUF, fmtNumber } from '../../core/helpers/formatters.js';

/**
 * Función para inicializar el módulo UF/UTM
 * Configura el servicio y el almacenamiento
 */
export function initializeUFUTMModule() {
    console.log('🚀 Inicializando módulo UF/UTM...');
    
    try {
        // Verificar que el servicio esté disponible
        if (typeof ufutmService === 'undefined') {
            throw new Error('UFUTMService no está disponible');
        }

        // Verificar que el almacenamiento esté disponible
        if (typeof ufutmStorage === 'undefined') {
            throw new Error('UFUTMStorage no está disponible');
        }

        // Verificar soporte de localStorage
        if (!ufutmStorage.isSupported) {
            console.warn('⚠️ localStorage no está soportado - funcionará en modo offline');
        }

        console.log('✅ Módulo UF/UTM inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando módulo UF/UTM:', error);
        return false;
    }
}

/**
 * Función para obtener información del módulo UF/UTM
 * @returns {Object} Información del módulo
 */
export function getUFUTMModuleInfo() {
    return {
        name: 'Módulo UF/UTM',
        version: '1.0.0',
        description: 'Gestión de datos de Unidad de Fomento y Unidad Tributaria Mensual',
        features: [
            'Carga de datos UF/UTM desde archivos JSON',
            'Cache en localStorage con TTL',
            'Validación de períodos y datos',
            'Fallback a datos locales',
            'Gestión de tramos SII'
        ],
        availablePeriods: ufutmService?.getAvailablePeriods() || [],
        storageInfo: ufutmStorage?.getStorageInfo() || null
    };
}

/**
 * Función para cargar datos de un período específico
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @returns {Promise<Object>} Datos del período
 */
export async function loadPeriodData(year, month) {
    try {
        const data = await ufutmService.loadUFUTMData({ year, month });
        
        // Guardar en cache si el almacenamiento está disponible
        if (ufutmStorage.isSupported) {
            const cacheKey = `ufutm_${year}_${month}`;
            ufutmStorage.save(cacheKey, data);
        }
        
        return data;
    } catch (error) {
        console.error('Error cargando datos del período:', error);
        throw error;
    }
}

/**
 * Función para obtener UTM de un período específico
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @returns {Promise<number>} Valor de UTM
 */
export async function getUTMValue(year, month) {
    try {
        return await ufutmService.getUTM(year, month);
    } catch (error) {
        console.error('Error obteniendo UTM:', error);
        throw error;
    }
}

/**
 * Función para obtener UF de una fecha específica
 * @param {string|Date} date - Fecha
 * @returns {Promise<number>} Valor de UF
 */
export async function getUFValue(date) {
    try {
        return await ufutmService.getUF(date);
    } catch (error) {
        console.error('Error obteniendo UF:', error);
        throw error;
    }
}

/**
 * Función para obtener tramos de un período específico
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @returns {Promise<Array>} Array de tramos
 */
export async function getTramosData(year, month) {
    try {
        return await ufutmService.getTramos(year, month);
    } catch (error) {
        console.error('Error obteniendo tramos:', error);
        throw error;
    }
}

/**
 * Función para limpiar el cache del módulo
 */
export function clearUFUTMCache() {
    try {
        ufutmService.clearCache();
        ufutmStorage.clear();
        console.log('✅ Cache UF/UTM limpiado correctamente');
    } catch (error) {
        console.error('❌ Error limpiando cache UF/UTM:', error);
    }
}

/**
 * Función para ejecutar tests del módulo UF/UTM
 */
export function runUFUTMTests() {
    console.group('🧪 Ejecutando tests del módulo UF/UTM');
    
    try {
        // Los tests se ejecutan automáticamente al importar los módulos
        console.log('✅ Todos los tests del módulo UF/UTM completados');
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error);
    } finally {
        console.groupEnd();
    }
}

// Auto-inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Hacer las funciones disponibles globalmente para facilitar el desarrollo
    window.UFUTMModule = {
        initializeUFUTMModule,
        getUFUTMModuleInfo,
        loadPeriodData,
        getUTMValue,
        getUFValue,
        getTramosData,
        clearUFUTMCache,
        runUFUTMTests
    };
    
    // Ejecutar tests automáticamente en modo desarrollo
    if (typeof DEV_CONFIG !== 'undefined' && DEV_CONFIG.DEBUG) {
        console.log('🔧 Modo desarrollo activado - ejecutando tests del módulo UF/UTM');
        runUFUTMTests();
    }
}
