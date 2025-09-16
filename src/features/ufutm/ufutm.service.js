export class UFUTMService {
    constructor() {
        this.storagePrefix = 'calc_ufutm_';
    }

    /**
     * Carga los datos UF/UTM de un período desde localStorage
     * @param {number} anio - Año
     * @param {number} mes - Mes (1-12)
     * @returns {Promise<Object|null>} Datos del período o null si no existen
     */
    async cargarDatosPeriodo(anio, mes) {
        const key = `${this.storagePrefix}${anio}_${mes.toString().padStart(2, '0')}`;
        const stored = localStorage.getItem(key);
        
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parseando datos UF/UTM guardados:', e);
                return null;
            }
        }
        
        return null;
    }

    /**
     * Guarda los datos UF/UTM de un período en localStorage
     * @param {number} anio - Año
     * @param {number} mes - Mes (1-12)
     * @param {Object} datos - Datos UF/UTM
     * @returns {Promise<boolean>} True si se guardó correctamente
     */
    async guardarDatosPeriodo(anio, mes, datos) {
        const key = `${this.storagePrefix}${anio}_${mes.toString().padStart(2, '0')}`;
        const data = {
            vigencia: `${anio}-${mes.toString().padStart(2, '0')}-01`,
            periodo_label: `${this.getNombreMes(mes)} ${anio}`,
            uf: datos.uf || {},
            utm: datos.utm || null,
            fechaGuardado: new Date().toISOString()
        };

        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error guardando datos UF/UTM:', e);
            return false;
        }
    }

    /**
     * Obtiene la lista de períodos guardados
     * @returns {Array} Lista de períodos ordenados por fecha
     */
    obtenerPeriodosGuardados() {
        const periodos = [];
        
        for (let key in localStorage) {
            if (key.startsWith(this.storagePrefix)) {
                const parts = key.replace(this.storagePrefix, '').split('_');
                if (parts.length === 2) {
                    periodos.push({
                        anio: parseInt(parts[0]),
                        mes: parseInt(parts[1]),
                        key: key
                    });
                }
            }
        }
        
        return periodos.sort((a, b) => {
            if (a.anio !== b.anio) return b.anio - a.anio;
            return b.mes - a.mes;
        });
    }

    /**
     * Elimina un período guardado
     * @param {number} anio - Año
     * @param {number} mes - Mes (1-12)
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminarPeriodo(anio, mes) {
        const key = `${this.storagePrefix}${anio}_${mes.toString().padStart(2, '0')}`;
        localStorage.removeItem(key);
        return true;
    }

    /**
     * Exporta todos los períodos guardados
     * @returns {Object} Datos de todos los períodos
     */
    exportarTodos() {
        const periodos = this.obtenerPeriodosGuardados();
        const datos = {};
        
        periodos.forEach(p => {
            const data = localStorage.getItem(p.key);
            if (data) {
                datos[`${p.anio}_${p.mes.toString().padStart(2, '0')}`] = JSON.parse(data);
            }
        });
        
        return datos;
    }

    /**
     * Importa datos desde un JSON
     * @param {Object} datos - Datos a importar
     * @returns {Promise<number>} Número de períodos importados
     */
    async importarDatos(datos) {
        let importados = 0;
        
        for (let key in datos) {
            const parts = key.split('_');
            if (parts.length === 2) {
                const anio = parseInt(parts[0]);
                const mes = parseInt(parts[1]);
                
                if (datos[key].uf || datos[key].utm) {
                    await this.guardarDatosPeriodo(anio, mes, datos[key]);
                    importados++;
                }
            }
        }
        
        return importados;
    }

    /**
     * Obtiene el nombre del mes
     * @param {number} numeroMes - Número del mes (1-12)
     * @returns {string} Nombre del mes
     */
    getNombreMes(numeroMes) {
        const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[numeroMes] || '';
    }

    /**
     * Valida los datos UF/UTM
     * @param {Object} datos - Datos a validar
     * @returns {Array} Lista de errores encontrados
     */
    validarDatos(datos) {
        const errores = [];
        
        // Validar UF
        if (datos.uf && typeof datos.uf === 'object') {
            const fechasUF = Object.keys(datos.uf);
            fechasUF.forEach(fecha => {
                const valor = datos.uf[fecha];
                if (isNaN(valor) || valor <= 0) {
                    errores.push(`UF ${fecha}: El valor debe ser un número positivo`);
                }
            });
        }
        
        // Validar UTM
        if (datos.utm !== null && datos.utm !== undefined) {
            if (isNaN(datos.utm) || datos.utm <= 0) {
                errores.push('UTM: El valor debe ser un número positivo');
            }
        }
        
        return errores;
    }
}