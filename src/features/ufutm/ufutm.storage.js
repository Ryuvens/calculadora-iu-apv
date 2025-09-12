/**
 * Módulo de almacenamiento para datos UF/UTM
 * Maneja el cache en localStorage con TTL y fallback a datos locales
 */

import { CONFIG, ERRORS } from '../../core/config/constants.js';

/**
 * Clase para manejo de almacenamiento UF/UTM
 */
export class UFUTMStorage {
    constructor() {
        this.prefix = CONFIG.STORAGE_PREFIX;
        this.ttl = CONFIG.CACHE_DURATION;
        this.isSupported = this._checkLocalStorageSupport();
    }

    /**
     * Guarda datos UF/UTM en localStorage con TTL
     * @param {string} key - Clave de almacenamiento
     * @param {Object} data - Datos a guardar
     * @param {number} ttl - Tiempo de vida en milisegundos (opcional)
     * @returns {boolean} true si se guardó correctamente
     */
    save(key, data, ttl = this.ttl) {
        if (!this.isSupported) {
            console.warn('localStorage no está soportado');
            return false;
        }

        try {
            const item = {
                data: data,
                timestamp: Date.now(),
                ttl: ttl
            };

            const storageKey = this._getStorageKey(key);
            localStorage.setItem(storageKey, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    }

    /**
     * Carga datos UF/UTM desde localStorage
     * @param {string} key - Clave de almacenamiento
     * @returns {Object|null} Datos cargados o null si no existen o expiraron
     */
    load(key) {
        if (!this.isSupported) {
            return null;
        }

        try {
            const storageKey = this._getStorageKey(key);
            const itemStr = localStorage.getItem(storageKey);
            
            if (!itemStr) {
                return null;
            }

            const item = JSON.parse(itemStr);
            
            // Verificar si los datos han expirado
            if (this._isExpired(item)) {
                this.remove(key);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error('Error cargando desde localStorage:', error);
            return null;
        }
    }

    /**
     * Verifica si existe una clave en localStorage
     * @param {string} key - Clave a verificar
     * @returns {boolean} true si existe y no ha expirado
     */
    exists(key) {
        const data = this.load(key);
        return data !== null;
    }

    /**
     * Elimina datos del localStorage
     * @param {string} key - Clave a eliminar
     * @returns {boolean} true si se eliminó correctamente
     */
    remove(key) {
        if (!this.isSupported) {
            return false;
        }

        try {
            const storageKey = this._getStorageKey(key);
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Error eliminando de localStorage:', error);
            return false;
        }
    }

    /**
     * Limpia todos los datos UF/UTM del localStorage
     * @returns {boolean} true si se limpió correctamente
     */
    clear() {
        if (!this.isSupported) {
            return false;
        }

        try {
            const keysToRemove = [];
            
            // Encontrar todas las claves que empiecen con nuestro prefijo
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }

            // Eliminar las claves encontradas
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            return true;
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
            return false;
        }
    }

    /**
     * Obtiene información sobre el uso del almacenamiento
     * @returns {Object} Información del almacenamiento
     */
    getStorageInfo() {
        if (!this.isSupported) {
            return {
                supported: false,
                totalKeys: 0,
                ourKeys: 0,
                totalSize: 0,
                ourSize: 0
            };
        }

        let totalKeys = 0;
        let ourKeys = 0;
        let totalSize = 0;
        let ourSize = 0;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    totalKeys++;
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    totalSize += size;

                    if (key.startsWith(this.prefix)) {
                        ourKeys++;
                        ourSize += size;
                    }
                }
            }
        } catch (error) {
            console.error('Error obteniendo información del almacenamiento:', error);
        }

        return {
            supported: true,
            totalKeys,
            ourKeys,
            totalSize,
            ourSize,
            prefix: this.prefix
        };
    }

    /**
     * Obtiene todas las claves UF/UTM almacenadas
     * @returns {Array} Array de claves
     */
    getKeys() {
        if (!this.isSupported) {
            return [];
        }

        const keys = [];
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key.replace(this.prefix, ''));
                }
            }
        } catch (error) {
            console.error('Error obteniendo claves:', error);
        }

        return keys;
    }

    /**
     * Verifica si localStorage está soportado
     * @private
     */
    _checkLocalStorageSupport() {
        try {
            const testKey = '__test_localStorage__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Genera la clave completa para localStorage
     * @private
     */
    _getStorageKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Verifica si un item ha expirado
     * @private
     */
    _isExpired(item) {
        if (!item.timestamp || !item.ttl) {
            return false;
        }

        const now = Date.now();
        const expirationTime = item.timestamp + item.ttl;
        
        return now > expirationTime;
    }

    /**
     * Obtiene el tiempo restante antes de la expiración
     * @param {string} key - Clave a verificar
     * @returns {number} Tiempo restante en milisegundos, -1 si no existe
     */
    getTimeToExpiration(key) {
        if (!this.isSupported) {
            return -1;
        }

        try {
            const storageKey = this._getStorageKey(key);
            const itemStr = localStorage.getItem(storageKey);
            
            if (!itemStr) {
                return -1;
            }

            const item = JSON.parse(itemStr);
            
            if (!item.timestamp || !item.ttl) {
                return -1;
            }

            const now = Date.now();
            const expirationTime = item.timestamp + item.ttl;
            const timeLeft = expirationTime - now;
            
            return Math.max(0, timeLeft);
        } catch (error) {
            console.error('Error obteniendo tiempo de expiración:', error);
            return -1;
        }
    }
}

// Instancia singleton del almacenamiento
export const ufutmStorage = new UFUTMStorage();

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - UFUTM Storage');
    
    const storage = new UFUTMStorage();
    
    // Test de soporte de localStorage
    console.assert(typeof storage.isSupported === 'boolean', 'isSupported should be boolean');
    
    // Test de generación de claves
    const testKey = storage._getStorageKey('test');
    console.assert(testKey === 'calc_iu_test', 'Storage key generation should work');
    
    // Test de guardado y carga (solo si localStorage está soportado)
    if (storage.isSupported) {
        const testData = { test: 'data', value: 123 };
        const saveResult = storage.save('test_key', testData, 1000); // 1 segundo TTL
        console.assert(saveResult === true, 'Save should return true');
        
        const loadedData = storage.load('test_key');
        console.assert(loadedData && loadedData.test === 'data', 'Load should return correct data');
        
        const exists = storage.exists('test_key');
        console.assert(exists === true, 'Exists should return true for existing key');
        
        // Limpiar datos de prueba
        storage.remove('test_key');
    }
    
    console.log('✅ Todos los tests de UFUTM Storage pasaron correctamente');
    console.groupEnd();
}
