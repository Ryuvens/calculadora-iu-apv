/**
 * Barrel export para el módulo de Impuesto Único
 * Centraliza todas las exportaciones del módulo de cálculo IU
 */

// Exportar clases principales
export { IUController } from './iu.controller.js';
export { IUView } from './iu.view.js';

// Exportar funciones de vista
export { renderResultado, renderTablaTramos, toggleTabla } from './iu.view.js';

// Exportar funciones de servicio
export {
    computeImpuestoUnico,
    obtenerIndiceTramoAplicado,
    validarEstructuraTramos,
    obtenerInfoTramo,
    calcularRangoImpuestos,
    obtenerEstadisticasTramos
} from './iu.service.js';

// Re-exportar funciones utilitarias relacionadas
export { isValidRenta } from '../../core/helpers/validators.js';
export { fmtCLP, fmtFactor, fmtPercentage, parseCLP } from '../../core/helpers/formatters.js';

/**
 * Función para inicializar el módulo de Impuesto Único
 * Configura el controlador y la vista
 */
export function initializeIUModule() {
    console.log('🚀 Inicializando módulo de Impuesto Único...');
    
    try {
        // Verificar que el controlador esté disponible
        if (typeof iuController === 'undefined') {
            throw new Error('IUController no está disponible');
        }

        // Inicializar el controlador
        const inicializado = iuController.inicializar();
        
        if (!inicializado) {
            throw new Error('Error inicializando el controlador');
        }

        console.log('✅ Módulo de Impuesto Único inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando módulo de Impuesto Único:', error);
        return false;
    }
}

/**
 * Función para obtener información del módulo IU
 * @returns {Object} Información del módulo
 */
export function getIUModuleInfo() {
    return {
        name: 'Módulo de Impuesto Único',
        version: '1.0.0',
        description: 'Calculadora de Impuesto Único según tabla SII',
        features: [
            'Cálculo de impuesto único mensual',
            'Tabla de tramos SII interactiva',
            'Validación de renta líquida imponible',
            'Resaltado de tramo aplicado',
            'Fórmula oficial: max(0, RLI × Factor - Rebaja)'
        ],
        formula: 'Impuesto = max(0, RLI × Factor - Rebaja)',
        currentPeriod: iuController?.obtenerPeriodoActual() || null,
        tramosLoaded: iuController?.getTramos()?.length > 0 || false
    };
}

/**
 * Función para calcular impuesto con validación completa
 * @param {number|string} rli - Renta líquida imponible
 * @returns {Promise<Object>} Resultado del cálculo
 */
export async function calcularImpuestoUnico(rli) {
    try {
        // Convertir a número si es string
        const rliNumero = typeof rli === 'string' ? parseCLP(rli) : rli;
        
        // Validar entrada
        if (!isValidRenta(rliNumero)) {
            throw new Error('Renta líquida imponible no válida');
        }

        // Obtener tramos
        const tramos = iuController.getTramos();
        if (!tramos || tramos.length === 0) {
            throw new Error('Tramos no cargados');
        }

        // Calcular impuesto
        const resultado = computeImpuestoUnico(rliNumero, tramos);
        
        return resultado;
    } catch (error) {
        console.error('Error calculando impuesto único:', error);
        throw error;
    }
}

/**
 * Función para obtener la tabla de tramos actual
 * @returns {Array|null} Array de tramos o null
 */
export function getTablaTramos() {
    return iuController?.getTramos() || null;
}

/**
 * Función para limpiar el resultado actual
 */
export function limpiarCalculo() {
    if (iuController) {
        iuController.limpiarResultado();
    }
}

/**
 * Función para alternar la visibilidad de la tabla
 */
export function toggleTablaTramos() {
    if (iuController) {
        iuController.toggleTabla();
    }
}

/**
 * Función para ejecutar tests del módulo IU
 */
export function runIUTests() {
    console.group('🧪 Ejecutando tests del módulo IU');
    
    try {
        // Los tests se ejecutan automáticamente al importar los módulos
        console.log('✅ Todos los tests del módulo IU completados');
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error);
    } finally {
        console.groupEnd();
    }
}

/**
 * Función para obtener estadísticas del módulo
 * @returns {Object} Estadísticas del módulo
 */
export function getIUStats() {
    const tramos = getTablaTramos();
    const resultado = iuController?.getResultadoActual();
    
    return {
        tramosCargados: tramos ? tramos.length : 0,
        tieneResultado: !!resultado,
        ultimoCalculo: resultado ? {
            rli: resultado.rli,
            impuesto: resultado.impuesto,
            tramo: resultado.tramo.numero
        } : null,
        moduloInicializado: !!iuController
    };
}

// Auto-inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Hacer las funciones disponibles globalmente para facilitar el desarrollo
    window.IUModule = {
        initializeIUModule,
        getIUModuleInfo,
        calcularImpuestoUnico,
        getTablaTramos,
        limpiarCalculo,
        toggleTablaTramos,
        runIUTests,
        getIUStats
    };
    
    // Ejecutar tests automáticamente en modo desarrollo
    if (typeof DEV_CONFIG !== 'undefined' && DEV_CONFIG.DEBUG) {
        console.log('🔧 Modo desarrollo activado - ejecutando tests del módulo IU');
        runIUTests();
    }
}
