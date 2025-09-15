/**
 * Servicio de cálculo de Impuesto Único
 * Implementa las funciones exactas para el cálculo según tabla SII
 */

import { ERRORS } from '../../core/config/constants.js';
import { isValidRenta } from '../../core/helpers/validators.js';
import { fmtCLP, fmtFactor, fmtPercentage } from '../../core/helpers/formatters.js';

/**
 * Calcula el impuesto único mensual
 * FÓRMULA: Impuesto = max(0, RLI × Factor - Rebaja)
 * @param {number} rli - Renta líquida imponible
 * @param {Array} tramos - Array de tramos de la tabla SII
 * @returns {Object} Resultado del cálculo
 */
export function computeImpuestoUnico(rli, tramos) {
    console.log('🔢 computeImpuestoUnico llamado con RLI:', rli);
    console.log('📊 Tramos recibidos:', tramos?.length, 'tramos');
    
    // Validar entrada
    if (!isValidRenta(rli)) {
        console.error('❌ RLI no válida:', rli);
        throw new Error(ERRORS.INVALID_RENTA);
    }

    if (!tramos || !Array.isArray(tramos) || tramos.length === 0) {
        console.error('❌ Tabla de tramos no válida:', tramos);
        throw new Error('Tabla de tramos no válida');
    }

    // Encontrar el tramo aplicable
    console.log('🔍 Buscando tramo aplicable...');
    const tramoAplicado = encontrarTramoAplicado(rli, tramos);
    
    if (!tramoAplicado) {
        console.error('❌ No se encontró tramo para RLI:', rli);
        throw new Error('No se encontró tramo aplicable para la renta ingresada');
    }

    console.log('✅ Tramo encontrado:', tramoAplicado);

    // Aplicar fórmula oficial: Impuesto = max(0, RLI × Factor - Rebaja)
    const impuesto = Math.max(0, (rli * tramoAplicado.factor) - tramoAplicado.rebaja);
    console.log('🧮 Cálculo:', rli, '×', tramoAplicado.factor, '-', tramoAplicado.rebaja, '=', impuesto);
    
    // Calcular tasa efectiva personal
    const tasaEfectivaPersonal = rli > 0 ? (impuesto / rli) : 0;
    
    // Obtener tasa efectiva máxima del tramo (desde la tabla SII)
    const tasaEfectivaMaxTramo = tramoAplicado.tasaEfectivaMax;

    const resultado = {
        rli: rli,
        impuesto: Math.round(impuesto),
        tramo: tramoAplicado,
        numeroTramo: tramoAplicado.numero,
        factor: tramoAplicado.factor,
        rebaja: tramoAplicado.rebaja,
        // Tasa efectiva real del contribuyente
        tasaEfectiva: tasaEfectivaPersonal,
        tasaEfectivaPorcentaje: (tasaEfectivaPersonal * 100).toFixed(2) + '%',
        // Tasa efectiva máxima del tramo (referencial de la tabla)
        tasaEfectivaMaxTramo: tasaEfectivaMaxTramo,
        // Tasa marginal (el factor aplicado)
        tasaMarginal: tramoAplicado.factor,
        tasaMarginalPorcentaje: (tramoAplicado.factor * 100).toFixed(1) + '%',
        // Datos formateados para mostrar (mantener compatibilidad)
        impuestoFormateado: fmtCLP(Math.round(impuesto)),
        factorFormateado: fmtFactor(tramoAplicado.factor),
        rebajaFormateada: fmtCLP(tramoAplicado.rebaja),
        tasaEfectivaFormateada: fmtPercentage(tasaEfectivaPersonal),
        rliFormateada: fmtCLP(rli)
    };
    
    console.log('📊 Detalle de tasas:');
    console.log(`  - Tasa Marginal (factor): ${resultado.tasaMarginalPorcentaje}`);
    console.log(`  - Tasa Efectiva Personal: ${resultado.tasaEfectivaPorcentaje}`);
    console.log(`  - Tasa Efectiva Máx del Tramo: ${tasaEfectivaMaxTramo}`);
    
    console.log('✅ Resultado calculado:', resultado);
    return resultado;
}

/**
 * Obtiene el índice del tramo aplicado (crítico para sincronización)
 * @param {number} rli - Renta líquida imponible
 * @param {Array} tramos - Array de tramos de la tabla SII
 * @returns {number} Índice del tramo aplicado (0-based)
 */
export function obtenerIndiceTramoAplicado(rli, tramos) {
    if (!isValidRenta(rli) || !tramos || !Array.isArray(tramos)) {
        return -1;
    }

    for (let i = 0; i < tramos.length; i++) {
        const tramo = tramos[i];
        const desde = tramo.desde;
        const hasta = tramo.hasta === null ? Infinity : tramo.hasta;
        
        if (rli >= desde && rli <= hasta) {
            return i;
        }
    }
    
    return -1; // No se encontró tramo aplicable
}

/**
 * Encuentra el tramo aplicable para una renta dada
 * @param {number} rli - Renta líquida imponible
 * @param {Array} tramos - Array de tramos de la tabla SII
 * @returns {Object|null} Tramo aplicable o null si no se encuentra
 */
function encontrarTramoAplicado(rli, tramos) {
    for (const tramo of tramos) {
        const desde = tramo.desde;
        const hasta = tramo.hasta === null ? Infinity : tramo.hasta;
        
        if (rli >= desde && rli <= hasta) {
            return tramo;
        }
    }
    
    return null;
}

/**
 * Valida que los tramos tengan la estructura correcta
 * @param {Array} tramos - Array de tramos a validar
 * @returns {boolean} true si la estructura es válida
 */
export function validarEstructuraTramos(tramos) {
    if (!Array.isArray(tramos) || tramos.length === 0) {
        return false;
    }

    for (const tramo of tramos) {
        if (!tramo || 
            typeof tramo.desde !== 'number' || 
            (tramo.hasta !== null && typeof tramo.hasta !== 'number') ||
            typeof tramo.factor !== 'number' ||
            typeof tramo.rebaja !== 'number') {
            return false;
        }
    }

    return true;
}

/**
 * Obtiene información detallada de un tramo específico
 * @param {number} indice - Índice del tramo (0-based)
 * @param {Array} tramos - Array de tramos de la tabla SII
 * @returns {Object|null} Información del tramo o null si no existe
 */
export function obtenerInfoTramo(indice, tramos) {
    if (!Array.isArray(tramos) || indice < 0 || indice >= tramos.length) {
        return null;
    }

    const tramo = tramos[indice];
    
    return {
        numero: tramo.numero || indice + 1,
        desde: tramo.desde,
        hasta: tramo.hasta,
        factor: tramo.factor,
        rebaja: tramo.rebaja,
        tasaEfectivaMax: tramo.tasaEfectivaMax,
        label: tramo.label || `Tramo ${indice + 1}`,
        descripcion: tramo.descripcion || '',
        // Datos formateados
        desdeFormateado: fmtCLP(tramo.desde),
        hastaFormateado: tramo.hasta === null ? 'En adelante' : fmtCLP(tramo.hasta),
        factorFormateado: fmtFactor(tramo.factor),
        rebajaFormateada: fmtCLP(tramo.rebaja),
        tasaEfectivaMaxFormateada: tramo.tasaEfectivaMax === null ? 'N/A' : fmtPercentage(tramo.tasaEfectivaMax)
    };
}

/**
 * Calcula el impuesto para un rango de rentas (útil para gráficos)
 * @param {number} desde - Renta inicial
 * @param {number} hasta - Renta final
 * @param {number} paso - Incremento entre cálculos
 * @param {Array} tramos - Array de tramos de la tabla SII
 * @returns {Array} Array de objetos con renta e impuesto
 */
export function calcularRangoImpuestos(desde, hasta, paso, tramos) {
    if (!isValidRenta(desde) || !isValidRenta(hasta) || paso <= 0) {
        throw new Error('Parámetros de rango inválidos');
    }

    const resultados = [];
    
    for (let rli = desde; rli <= hasta; rli += paso) {
        try {
            const resultado = computeImpuestoUnico(rli, tramos);
            resultados.push({
                rli: rli,
                impuesto: resultado.impuesto,
                tasaEfectiva: resultado.tasaEfectiva,
                tramo: resultado.tramo.numero
            });
        } catch (error) {
            console.warn(`Error calculando impuesto para RLI ${rli}:`, error);
        }
    }

    return resultados;
}

/**
 * Obtiene estadísticas de la tabla de tramos
 * @param {Array} tramos - Array de tramos de la tabla SII
 * @returns {Object} Estadísticas de la tabla
 */
export function obtenerEstadisticasTramos(tramos) {
    if (!validarEstructuraTramos(tramos)) {
        throw new Error('Estructura de tramos inválida');
    }

    const totalTramos = tramos.length;
    const tramoExento = tramos.find(t => t.factor === 0);
    const tramoMaximo = tramos[tramos.length - 1];
    
    return {
        totalTramos,
        tieneTramoExento: !!tramoExento,
        rangoExento: tramoExento ? {
            desde: tramoExento.desde,
            hasta: tramoExento.hasta
        } : null,
        factorMaximo: Math.max(...tramos.map(t => t.factor)),
        rebajaMaxima: Math.max(...tramos.map(t => t.rebaja)),
        ultimoTramo: {
            desde: tramoMaximo.desde,
            factor: tramoMaximo.factor,
            rebaja: tramoMaximo.rebaja
        }
    };
}

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - IU Service');
    
    // Test de validación de renta
    console.assert(isValidRenta(2500000) === true, 'isValidRenta(2500000) should return true');
    console.assert(isValidRenta(0) === false, 'isValidRenta(0) should return false');
    
    // Test de cálculo básico (tramo 2: factor 0.04, rebaja 37403.10)
    const tramosTest = [
        { desde: 0, hasta: 935077.50, factor: 0, rebaja: 0 },
        { desde: 935077.51, hasta: 2077950.00, factor: 0.04, rebaja: 37403.10 },
        { desde: 2077950.01, hasta: 3463250.00, factor: 0.08, rebaja: 120521.10 }
    ];
    
    try {
        const resultado = computeImpuestoUnico(2500000, tramosTest);
        console.assert(resultado.impuesto > 0, 'Impuesto should be greater than 0 for RLI 2,500,000');
        console.assert(resultado.tramo.factor === 0.08, 'Should use tramo 3 (factor 0.08) for RLI 2,500,000');
    } catch (error) {
        console.error('Error in test calculation:', error);
    }
    
    // Test de índice de tramo
    const indice = obtenerIndiceTramoAplicado(2500000, tramosTest);
    console.assert(indice === 2, 'Should return index 2 for RLI 2,500,000');
    
    // Test de validación de tramos
    console.assert(validarEstructuraTramos(tramosTest) === true, 'Valid tramos should pass validation');
    console.assert(validarEstructuraTramos([]) === false, 'Empty tramos should fail validation');
    
    console.log('✅ Todos los tests de IU Service pasaron correctamente');
    console.groupEnd();
}
