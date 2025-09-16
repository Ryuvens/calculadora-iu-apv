export class AdminService {
    constructor() {
        this.storagePrefix = 'calc_iu_tramos_';
    }

    /**
     * Carga los tramos de un período desde localStorage
     */
    async cargarPeriodo(anio, mes) {
        const key = `${this.storagePrefix}${anio}_${mes.toString().padStart(2, '0')}`;
        const stored = localStorage.getItem(key);
        
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parseando datos guardados:', e);
                return null;
            }
        }
        
        return null;
    }

    /**
     * Guarda los tramos de un período en localStorage
     */
    async guardarPeriodo(anio, mes, tramos) {
        const key = `${this.storagePrefix}${anio}_${mes.toString().padStart(2, '0')}`;
        
        const data = {
            vigencia: `${anio}-${mes.toString().padStart(2, '0')}-01`,
            periodo_label: `${this.getNombreMes(mes)} ${anio}`,
            moneda: 'CLP',
            tramos: tramos,
            fechaGuardado: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error guardando período:', e);
            return false;
        }
    }

    /**
     * Valida que los tramos tengan datos correctos
     */
    validarTramos(tramos) {
        const errores = [];
        
        // Validar que haya 8 tramos
        if (tramos.length !== 8) {
            errores.push('Debe haber exactamente 8 tramos');
        }
        
        // Validar cada tramo
        for (let i = 0; i < tramos.length; i++) {
            const tramo = tramos[i];
            const num = i + 1;
            
            // Validar desde y hasta
            if (i > 0) { // No validar el tramo exento
                if (isNaN(tramo.desde) || tramo.desde < 0) {
                    errores.push(`Tramo ${num}: El valor "Desde" debe ser un número positivo`);
                }
                
                if (i < 7) { // No validar el último "hasta"
                    if (isNaN(tramo.hasta) || tramo.hasta <= tramo.desde) {
                        errores.push(`Tramo ${num}: El valor "Hasta" debe ser mayor que "Desde"`);
                    }
                }
                
                // Validar continuidad
                if (i > 1) {
                    const tramoAnterior = tramos[i - 1];
                    const diferencia = Math.abs(tramo.desde - tramoAnterior.hasta);
                    if (diferencia > 0.01) {
                        errores.push(`Tramo ${num}: Debe comenzar donde termina el tramo ${num - 1}`);
                    }
                }
            }
            
            // Validar factor
            if (i === 0) { // Tramo 1 (índice 0)
                // Tramo exento DEBE tener factor 0
                if (tramo.factor !== 0) {
                    errores.push(`Tramo 1 (Exento): El factor debe ser 0`);
                }
            } else {
                // Otros tramos deben tener factor > 0 y <= 1
                if (isNaN(tramo.factor) || tramo.factor <= 0 || tramo.factor > 1) {
                    errores.push(`Tramo ${num}: El factor debe ser mayor que 0 y menor o igual a 1`);
                }
                
                // Validar que los factores sean crecientes
                if (i > 1) {
                    const factorAnterior = tramos[i - 1].factor;
                    if (tramo.factor < factorAnterior) {
                        errores.push(`Tramo ${num}: El factor debe ser mayor o igual al del tramo anterior`);
                    }
                }
            }
            
            // Validar rebaja
            if (isNaN(tramo.rebaja) || tramo.rebaja < 0) {
                errores.push(`Tramo ${num}: La rebaja debe ser un número positivo o cero`);
            }
        }
        
        return errores;
    }

    /**
     * Obtiene la lista de períodos guardados
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
     */
    async eliminarPeriodo(anio, mes) {
        const key = `${this.storagePrefix}${anio}_${mes.toString().padStart(2, '0')}`;
        localStorage.removeItem(key);
        return true;
    }

    /**
     * Exporta todos los períodos guardados
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
     */
    async importarDatos(datos) {
        let importados = 0;
        
        for (let key in datos) {
            const parts = key.split('_');
            if (parts.length === 2) {
                const anio = parseInt(parts[0]);
                const mes = parseInt(parts[1]);
                
                if (datos[key].tramos && datos[key].tramos.length === 8) {
                    await this.guardarPeriodo(anio, mes, datos[key].tramos);
                    importados++;
                }
            }
        }
        
        return importados;
    }

    getNombreMes(numeroMes) {
        const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[numeroMes] || '';
    }
}
