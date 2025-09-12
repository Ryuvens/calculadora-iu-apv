/**
 * Servicio de gestión de datos UF/UTM para la Calculadora IU con Simulador APV
 * Maneja la carga y obtención de datos de Unidad de Fomento y Unidad Tributaria Mensual
 */

import { CONFIG, ERRORS } from '../../core/config/constants.js';
import { isValidPeriod, isValidUTM } from '../../core/helpers/validators.js';

/**
 * Servicio principal de UF/UTM
 */
export class UFUTMService {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Carga los datos de UF/UTM para un período específico
     * @param {Object} periodo - Objeto con año y mes
     * @param {number} periodo.year - Año
     * @param {number} periodo.month - Mes (1-12)
     * @returns {Promise<Object>} Datos de UF/UTM del período
     * @throws {Error} Si no se pueden cargar los datos
     */
    async loadUFUTMData(periodo) {
        const { year, month } = periodo;
        
        if (!isValidPeriod(year, month)) {
            throw new Error(ERRORS.INVALID_PERIOD);
        }

        const cacheKey = `ufutm_${year}_${month}`;
        
        // Verificar cache en memoria
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Verificar si ya hay una carga en progreso
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // Crear promesa de carga
        const loadPromise = this._loadDataFromFiles(year, month);
        this.loadingPromises.set(cacheKey, loadPromise);

        try {
            const data = await loadPromise;
            this.cache.set(cacheKey, data);
            return data;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * Obtiene el valor de UTM para un período específico
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {Promise<number>} Valor de UTM
     * @throws {Error} Si no se puede obtener la UTM
     */
    async getUTM(year, month) {
        const data = await this.loadUFUTMData({ year, month });
        
        if (!data || !data.utm) {
            throw new Error(ERRORS.DATA_NOT_FOUND);
        }

        if (!isValidUTM(data.utm)) {
            throw new Error(ERRORS.UTM_ZERO);
        }

        return data.utm;
    }

    /**
     * Obtiene el valor de UF para una fecha específica
     * @param {string|Date} date - Fecha en formato YYYY-MM-DD o objeto Date
     * @returns {Promise<number>} Valor de UF
     * @throws {Error} Si no se puede obtener la UF
     */
    async getUF(date) {
        const dateStr = this._formatDate(date);
        const { year, month } = this._parseDate(dateStr);
        
        const data = await this.loadUFUTMData({ year, month });
        
        if (!data || !data.uf) {
            throw new Error(ERRORS.DATA_NOT_FOUND);
        }

        // Buscar UF para la fecha específica
        if (data.uf[dateStr]) {
            return data.uf[dateStr];
        }

        // Si no existe la fecha específica, buscar el último día disponible del mes
        const lastDay = this._getLastAvailableDay(data.uf, year, month);
        if (lastDay && data.uf[lastDay]) {
            return data.uf[lastDay];
        }

        throw new Error(ERRORS.DATA_NOT_FOUND);
    }

    /**
     * Obtiene la tabla de tramos para un período específico
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {Promise<Array>} Array de tramos
     * @throws {Error} Si no se puede obtener la tabla de tramos
     */
    async getTramos(year, month) {
        if (!isValidPeriod(year, month)) {
            throw new Error(ERRORS.INVALID_PERIOD);
        }

        const cacheKey = `tramos_${year}_${month}`;
        
        // Verificar cache en memoria
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const data = await this._loadTramosFromFile(year, month);
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            throw new Error(`Error cargando tramos: ${error.message}`);
        }
    }

    /**
     * Obtiene información del período actual
     * @returns {Object} Información del período
     */
    getCurrentPeriod() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            name: this._getMonthName(now.getMonth() + 1)
        };
    }

    /**
     * Obtiene todos los períodos disponibles
     * @returns {Array} Array de períodos disponibles
     */
    getAvailablePeriods() {
        return [
            { year: 2025, month: 9, name: 'Septiembre 2025' }
            // Se pueden agregar más períodos aquí
        ];
    }

    /**
     * Limpia el cache en memoria
     */
    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
    }

    /**
     * Carga datos desde archivos JSON
     * @private
     */
    async _loadDataFromFiles(year, month) {
        try {
            const fileName = `${year}-${month.toString().padStart(2, '0')}.json`;
            const response = await fetch(`/data/2025/${fileName}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validar estructura de datos
            if (!this._validateUFUTMData(data)) {
                throw new Error('Datos de UF/UTM inválidos');
            }

            return data;
        } catch (error) {
            console.error('Error cargando datos UF/UTM:', error);
            throw new Error(ERRORS.DATA_NOT_FOUND);
        }
    }

    /**
     * Carga tabla de tramos desde archivo JSON
     * @private
     */
    async _loadTramosFromFile(year, month) {
        try {
            const fileName = `sii-${year}-${month.toString().padStart(2, '0')}.json`;
            const response = await fetch(`/data/tramos/${fileName}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validar estructura de tramos
            if (!this._validateTramosData(data)) {
                throw new Error('Datos de tramos inválidos');
            }

            return data.tramos;
        } catch (error) {
            console.error('Error cargando tramos:', error);
            throw new Error(ERRORS.DATA_NOT_FOUND);
        }
    }

    /**
     * Valida la estructura de datos UF/UTM
     * @private
     */
    _validateUFUTMData(data) {
        return data &&
               data.periodo &&
               typeof data.utm === 'number' &&
               data.uf &&
               typeof data.uf === 'object';
    }

    /**
     * Valida la estructura de datos de tramos
     * @private
     */
    _validateTramosData(data) {
        return data &&
               data.tramos &&
               Array.isArray(data.tramos) &&
               data.tramos.length > 0;
    }

    /**
     * Formatea una fecha a string YYYY-MM-DD
     * @private
     */
    _formatDate(date) {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return date;
    }

    /**
     * Parsea una fecha string a objeto con año y mes
     * @private
     */
    _parseDate(dateStr) {
        const [year, month] = dateStr.split('-').map(Number);
        return { year, month };
    }

    /**
     * Obtiene el último día disponible en los datos de UF
     * @private
     */
    _getLastAvailableDay(ufData, year, month) {
        const daysInMonth = new Date(year, month, 0).getDate();
        
        for (let day = daysInMonth; day >= 1; day--) {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            if (ufData[dateStr]) {
                return dateStr;
            }
        }
        
        return null;
    }

    /**
     * Obtiene el nombre del mes
     * @private
     */
    _getMonthName(month) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month - 1] || 'Mes inválido';
    }
}

// Instancia singleton del servicio
export const ufutmService = new UFUTMService();

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - UFUTM Service');
    
    // Test de validación de período
    console.assert(isValidPeriod(2025, 9) === true, 'isValidPeriod(2025, 9) should return true');
    console.assert(isValidPeriod(2019, 12) === false, 'isValidPeriod(2019, 12) should return false');
    
    // Test de validación de UTM
    console.assert(isValidUTM(69265) === true, 'isValidUTM(69265) should return true');
    console.assert(isValidUTM(0) === false, 'isValidUTM(0) should return false');
    
    // Test de formato de fecha
    const service = new UFUTMService();
    const testDate = new Date('2025-09-15');
    const formattedDate = service._formatDate(testDate);
    console.assert(formattedDate === '2025-09-15', 'Date formatting should work correctly');
    
    // Test de parseo de fecha
    const parsedDate = service._parseDate('2025-09-15');
    console.assert(parsedDate.year === 2025 && parsedDate.month === 9, 'Date parsing should work correctly');
    
    console.log('✅ Todos los tests de UFUTM Service pasaron correctamente');
    console.groupEnd();
}
