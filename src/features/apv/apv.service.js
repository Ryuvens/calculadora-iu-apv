import { UFUTMService } from '../ufutm/ufutm.service.js';
import { computeImpuestoUnico } from '../iu/iu.service.js';

export class APVService {
    constructor() {
        this.ufutmService = new UFUTMService();
        
        // Parámetros por defecto
        this.parametros = {
            rentabilidadAnual: 0.04255, // 4.255%
            valorUF: 39486,
            valorUTM: 69265,
            topeRegimenA_UTM: 6, // 6 UTM anuales
            topeRegimenB_UF_mensual: 50, // 50 UF mensuales
            topeRegimenB_UF_anual: 600 // 600 UF anuales
        };
        
        this.tramosImpuesto = null;
    }

    async init() {
        // Cargar valores actuales de UF y UTM
        await this.actualizarValoresUFUTM();
        // Cargar tabla de impuestos
        await this.cargarTramosImpuesto();
    }

    async actualizarValoresUFUTM() {
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        const anio = fecha.getFullYear();
        
        const datos = await this.ufutmService.cargarDatosPeriodo(anio, mes);
        if (datos) {
            // Obtener UF del día actual
            const fechaHoy = `${anio}-${String(mes).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
            if (datos.uf && datos.uf[fechaHoy]) {
                this.parametros.valorUF = datos.uf[fechaHoy];
            }
            if (datos.utm) {
                this.parametros.valorUTM = datos.utm;
            }
        }
    }

    async cargarTramosImpuesto() {
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        const anio = fecha.getFullYear();
        const mesStr = mes.toString().padStart(2, '0');
        
        try {
            // PRIMERO: Intentar cargar desde localStorage
            const localStorageKey = `calc_iu_tramos_${anio}_${mesStr}`;
            const localData = localStorage.getItem(localStorageKey);
            
            if (localData) {
                const parsed = JSON.parse(localData);
                this.tramosImpuesto = parsed.tramos;
                console.log(`✅ Tramos APV cargados desde localStorage: ${this.tramosImpuesto.length} tramos`);
            } else {
                // SEGUNDO: Intentar cargar desde archivo JSON
                const response = await fetch(`/data/tramos/sii-${anio}-${mesStr}.json`);
                
                if (response.ok) {
                    const data = await response.json();
                    this.tramosImpuesto = data.tramos;
                    console.log(`✅ Tramos APV cargados desde archivo: ${this.tramosImpuesto.length} tramos`);
                } else {
                    throw new Error(`No hay datos para ${mesStr}/${anio}`);
                }
            }
        } catch (error) {
            console.warn('No se pudieron cargar tramos de impuesto, usando valores de referencia');
            // Usar tramos por defecto si no hay datos
            this.tramosImpuesto = [
                {"numero": 1, "desde": 0, "hasta": 935077.50, "factor": 0, "rebaja": 0},
                {"numero": 2, "desde": 935077.51, "hasta": 2077950.00, "factor": 0.04, "rebaja": 37403.10},
                {"numero": 3, "desde": 2077950.01, "hasta": 3463250.00, "factor": 0.08, "rebaja": 120521.10},
                {"numero": 4, "desde": 3463250.01, "hasta": 4848550.00, "factor": 0.135, "rebaja": 272540.10},
                {"numero": 5, "desde": 4848550.01, "hasta": 6233850.00, "factor": 0.23, "rebaja": 676540.10},
                {"numero": 6, "desde": 6233850.01, "hasta": 7619150.00, "factor": 0.304, "rebaja": 1021540.10},
                {"numero": 7, "desde": 7619150.01, "hasta": 9004450.00, "factor": 0.35, "rebaja": 1341540.10},
                {"numero": 8, "desde": 9004450.01, "hasta": null, "factor": 0.4, "rebaja": 1741540.10}
            ];
        }
    }

    /**
     * Calcula el beneficio del Régimen A (Bonificación Fiscal)
     */
    calcularRegimenA(montoAPVMensual) {
        const montoAPVAnual = montoAPVMensual * 12;
        
        // Calcular bonificación (15% del aporte)
        const bonificacionBruta = montoAPVAnual * 0.15;
        
        // Aplicar tope de 6 UTM
        const topeBonificacion = this.parametros.topeRegimenA_UTM * this.parametros.valorUTM;
        const bonificacionFinal = Math.min(bonificacionBruta, topeBonificacion);
        
        // Calcular aporte utilizable (el que recibe bonificación)
        const aporteUtilizable = Math.min(montoAPVAnual, topeBonificacion / 0.15);
        
        return {
            regimen: 'A',
            montoAPVMensual,
            montoAPVAnual,
            bonificacionMensual: Math.round(bonificacionFinal / 12),
            bonificacionAnual: Math.round(bonificacionFinal),
            aporteUtilizable: Math.round(aporteUtilizable),
            excedente: Math.max(0, montoAPVAnual - aporteUtilizable),
            topeBonificacion,
            beneficioTotal: Math.round(bonificacionFinal)
        };
    }

    /**
     * Calcula el beneficio del Régimen B (Rebaja de Base Imponible)
     */
    calcularRegimenB(rentaLiquida, montoAPVMensual) {
        // Estimar renta imponible (aproximación desde renta líquida)
        // Nota: En una implementación real, este factor debería ser configurable
        const rentaImponible = rentaLiquida * 1.13; // Factor aproximado
        
        // Calcular tope mensual en pesos
        const topeMensualPesos = this.parametros.topeRegimenB_UF_mensual * this.parametros.valorUF;
        
        // Determinar monto a rebajar (no puede exceder el tope)
        const montoRebajar = Math.min(montoAPVMensual, topeMensualPesos);
        
        // Calcular nueva base imponible
        const nuevaBaseImponible = Math.max(0, rentaImponible - montoRebajar);
        
        // Calcular impuestos en ambos escenarios
        const impuestoSinAPV = this.calcularImpuesto(rentaImponible);
        const impuestoConAPV = this.calcularImpuesto(nuevaBaseImponible);
        
        // Ahorro en impuestos
        const ahorroMensual = Math.max(0, impuestoSinAPV - impuestoConAPV);
        const ahorroAnual = ahorroMensual * 12;
        
        return {
            regimen: 'B',
            rentaImponible,
            montoAPVMensual,
            montoAPVAnual: montoAPVMensual * 12,
            montoRebajar,
            montoRebajarAnual: montoRebajar * 12,
            nuevaBaseImponible,
            impuestoSinAPV,
            impuestoConAPV,
            ahorroMensual: Math.round(ahorroMensual),
            ahorroAnual: Math.round(ahorroAnual),
            topeMensualPesos: Math.round(topeMensualPesos),
            topeAnualPesos: Math.round(topeMensualPesos * 12),
            beneficioTotal: Math.round(ahorroAnual)
        };
    }

    /**
     * Calcula el impuesto según tabla SII
     */
    calcularImpuesto(rentaImponible) {
        if (!this.tramosImpuesto || this.tramosImpuesto.length === 0) {
            // Cálculo aproximado si no hay tabla
            return rentaImponible * 0.05; // 5% aproximado
        }
        
        const resultado = computeImpuestoUnico(rentaImponible, this.tramosImpuesto);
        return resultado ? resultado.impuesto : 0;
    }

    /**
     * Compara ambos regímenes y recomienda el mejor
     */
    compararRegimenes(rentaLiquida, montoAPVMensual) {
        const regimenA = this.calcularRegimenA(montoAPVMensual);
        const regimenB = this.calcularRegimenB(rentaLiquida, montoAPVMensual);
        
        const mejorRegimen = regimenA.beneficioTotal > regimenB.beneficioTotal ? 'A' : 'B';
        const diferencia = Math.abs(regimenA.beneficioTotal - regimenB.beneficioTotal);
        
        return {
            regimenA,
            regimenB,
            recomendacion: mejorRegimen,
            diferencia: Math.round(diferencia),
            explicacion: this.generarExplicacion(mejorRegimen, regimenA, regimenB)
        };
    }

    /**
     * Genera explicación de la recomendación
     */
    generarExplicacion(mejorRegimen, regimenA, regimenB) {
        if (mejorRegimen === 'A') {
            return `El Régimen A te otorga una bonificación fiscal de $${regimenA.bonificacionAnual.toLocaleString('es-CL')} anuales, ` +
                   `superior al ahorro tributario del Régimen B de $${regimenB.ahorroAnual.toLocaleString('es-CL')}.`;
        } else {
            return `El Régimen B te permite ahorrar $${regimenB.ahorroAnual.toLocaleString('es-CL')} anuales en impuestos, ` +
                   `superior a la bonificación del Régimen A de $${regimenA.bonificacionAnual.toLocaleString('es-CL')}.`;
        }
    }

    /**
     * Calcula proyecciones a futuro
     */
    calcularProyecciones(datosRegimen, años) {
        const montoMensual = datosRegimen.montoAPVMensual;
        const beneficioAnual = datosRegimen.beneficioTotal;
        const rentabilidad = this.parametros.rentabilidadAnual;
        
        let capitalAcumulado = 0;
        let beneficioAcumulado = 0;
        
        for (let año = 1; año <= años; año++) {
            // Capital del año anterior con rentabilidad
            capitalAcumulado = capitalAcumulado * (1 + rentabilidad);
            
            // Agregar aportes del año
            capitalAcumulado += montoMensual * 12;
            
            // Agregar beneficio del año
            beneficioAcumulado += beneficioAnual;
            capitalAcumulado += beneficioAnual;
        }
        
        // Rentabilidad total generada
        const aportesSinBeneficio = montoMensual * 12 * años;
        const rentabilidadGenerada = capitalAcumulado - aportesSinBeneficio - beneficioAcumulado;
        
        return {
            años,
            capitalAhorrado: Math.round(capitalAcumulado),
            rentabilidadGenerada: Math.round(rentabilidadGenerada),
            beneficioAcumulado: Math.round(beneficioAcumulado),
            aportesRealizados: Math.round(aportesSinBeneficio)
        };
    }

    /**
     * Genera tabla comparativa con y sin APV
     */
    generarTablaComparativa(rentaLiquida, montoAPVMensual, regimen) {
        const rentaImponible = rentaLiquida * 1.13;
        
        let datosComparacion = {
            sinAPV: {
                ahorroMensual: 0,
                sueldoAfecto: Math.round(rentaImponible),
                impuestoPagar: Math.round(this.calcularImpuesto(rentaImponible)),
                ahorroImpuesto: 0,
                bonificacionFiscal: 0
            },
            conAPV: {
                ahorroMensual: montoAPVMensual
            }
        };
        
        if (regimen === 'A' || regimen === 'ambos') {
            const regimenA = this.calcularRegimenA(montoAPVMensual);
            datosComparacion.conAPV = {
                ...datosComparacion.conAPV,
                sueldoAfecto: Math.round(rentaImponible), // No cambia en régimen A
                impuestoPagar: datosComparacion.sinAPV.impuestoPagar, // No cambia
                ahorroImpuesto: 0,
                bonificacionFiscal: regimenA.bonificacionMensual
            };
        } else {
            const regimenB = this.calcularRegimenB(rentaLiquida, montoAPVMensual);
            datosComparacion.conAPV = {
                ...datosComparacion.conAPV,
                sueldoAfecto: Math.round(regimenB.nuevaBaseImponible),
                impuestoPagar: Math.round(regimenB.impuestoConAPV),
                ahorroImpuesto: regimenB.ahorroMensual,
                bonificacionFiscal: 0
            };
        }
        
        return datosComparacion;
    }

    /**
     * Obtiene los parámetros actuales
     */
    getParametros() {
        return {
            ...this.parametros,
            topeRegimenA_pesos: Math.round(this.parametros.topeRegimenA_UTM * this.parametros.valorUTM),
            topeRegimenB_mensual_pesos: Math.round(this.parametros.topeRegimenB_UF_mensual * this.parametros.valorUF),
            topeRegimenB_anual_pesos: Math.round(this.parametros.topeRegimenB_UF_anual * this.parametros.valorUF)
        };
    }

    /**
     * Actualiza parámetros personalizados
     */
    setParametros(nuevosParametros) {
        this.parametros = {
            ...this.parametros,
            ...nuevosParametros
        };
    }
}
