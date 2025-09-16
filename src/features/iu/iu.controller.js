/**
 * Controlador de la Calculadora de Impuesto Único
 * Maneja la lógica de negocio y control de ejecución
 */

import { computeImpuestoUnico, obtenerIndiceTramoAplicado } from './iu.service.js';
import { IUView } from './iu.view.js';
import { ERRORS } from '../../core/config/constants.js';
import { isValidRenta } from '../../core/helpers/validators.js';
import { parseCLP } from '../../core/helpers/formatters.js';
import { applyThousandsSeparator, getCleanNumber } from '../../core/helpers/input-mask.js';

/**
 * Controlador principal de la Calculadora IU
 */
export class IUController {
    constructor() {
        this.view = new IUView();
        this.tramosActuales = null;
        this.isCalculando = false;
    }

    /**
     * Inicializa el controlador
     */
    async init() {
        console.log('🧮 Inicializando IUController...');
        
        try {
            // Establecer período inicial desde los selectores
            const mesCalculo = document.getElementById('mes-calculo');
            const anioCalculo = document.getElementById('anio-calculo');
            
            if (mesCalculo && anioCalculo) {
                this.periodoActual = {
                    mes: parseInt(mesCalculo.value),
                    anio: parseInt(anioCalculo.value)
                };
            } else {
                // Valor por defecto
                this.periodoActual = {
                    mes: 9,  // Septiembre
                    anio: 2025
                };
            }
            
            // Cargar tramos
            await this.loadTramos();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ IUController inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando IUController:', error);
            return false;
        }
    }

    /**
     * Carga los tramos del período actual
     */
    async loadTramos() {
        try {
            const { mes, anio } = this.periodoActual || { mes: 9, anio: 2025 };
            const mesStr = mes.toString().padStart(2, '0');
            
            console.log(`📊 Cargando tramos para ${mesStr}/${anio}`);
            
            // PRIMERO: Intentar cargar desde localStorage
            const localStorageKey = `calc_iu_tramos_${anio}_${mesStr}`;
            const localData = localStorage.getItem(localStorageKey);
            
            if (localData) {
                const parsed = JSON.parse(localData);
                this.tramosActuales = parsed.tramos;
                console.log(`✅ Tramos cargados desde localStorage: ${this.tramosActuales.length} tramos`);
                this.mostrarEstadoPeriodo(`Datos cargados: ${this.getNombreMes(mes)} ${anio} (guardados localmente)`);
            } else {
                // SEGUNDO: Intentar cargar desde archivo JSON
                const response = await fetch(`/data/tramos/sii-${anio}-${mesStr}.json`);
                
                if (!response.ok) {
                    throw new Error(`No hay datos para ${mesStr}/${anio}`);
                }
                
                const data = await response.json();
                this.tramosActuales = data.tramos;
                console.log(`✅ Tramos cargados desde archivo: ${this.tramosActuales.length} tramos`);
                this.mostrarEstadoPeriodo(`Datos cargados: ${this.getNombreMes(mes)} ${anio}`);
            }
            
            // Renderizar tabla si está visible
            if (document.querySelector('#tabla-sii-container:not(.hidden)')) {
                this.view.renderTablaTramos(this.tramosActuales, -1);
            }
            
        } catch (error) {
            console.error('❌ Error cargando tramos:', error);
            this.mostrarEstadoPeriodo(`⚠️ Sin datos para ${this.getNombreMes(this.periodoActual?.mes || 9)} ${this.periodoActual?.anio || 2025}. Usando valores de referencia.`);
            await this.loadTramosRespaldo();
        }
    }

    async loadTramosRespaldo() {
        this.tramosActuales = [
            {"numero": 1, "desde": 0, "hasta": 935077.50, "factor": 0, "rebaja": 0},
            {"numero": 2, "desde": 935077.51, "hasta": 2077950.00, "factor": 0.04, "rebaja": 37403.10},
            {"numero": 3, "desde": 2077950.01, "hasta": 3463250.00, "factor": 0.08, "rebaja": 120521.10},
            {"numero": 4, "desde": 3463250.01, "hasta": 4848550.00, "factor": 0.135, "rebaja": 310999.85},
            {"numero": 5, "desde": 4848550.01, "hasta": 6233850.00, "factor": 0.23, "rebaja": 771612.10},
            {"numero": 6, "desde": 6233850.01, "hasta": 8311800.00, "factor": 0.304, "rebaja": 1232917.00},
            {"numero": 7, "desde": 8311800.01, "hasta": 21472150.00, "factor": 0.35, "rebaja": 1615259.80},
            {"numero": 8, "desde": 21472150.01, "hasta": 999999999, "factor": 0.4, "rebaja": 2688867.30}
        ];
        console.log('✅ Usando tramos de fallback:', this.tramosActuales.length, 'tramos');
        this.view.renderTablaTramos(this.tramosActuales, -1);
    }

    mostrarEstadoPeriodo(mensaje) {
        const statusEl = document.getElementById('estado-periodo');
        if (statusEl) {
            statusEl.textContent = mensaje;
            statusEl.style.display = 'block';
            
            // Determinar el tipo de mensaje para aplicar estilos
            if (mensaje.includes('guardados localmente')) {
                statusEl.className = 'periodo-status success';
            } else if (mensaje.includes('Sin datos')) {
                statusEl.className = 'periodo-status warning';
            } else {
                statusEl.className = 'periodo-status info';
            }
        }
        console.log('📅 Estado período:', mensaje);
    }

    getNombreMes(numeroMes) {
        const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[numeroMes] || '';
    }

    async onPeriodoChange() {
        console.log('📅 Período de cálculo cambiado');
        
        // Actualizar período actual
        const mesCalculo = document.getElementById('mes-calculo');
        const anioCalculo = document.getElementById('anio-calculo');
        
        if (mesCalculo && anioCalculo) {
            this.periodoActual = {
                mes: parseInt(mesCalculo.value),
                anio: parseInt(anioCalculo.value)
            };
        }
        
        // Recargar tramos del nuevo período
        await this.loadTramos();
        
        // Limpiar resultado anterior
        const resultadoContainer = document.getElementById('resultado-iu');
        if (resultadoContainer) {
            resultadoContainer.classList.add('hidden');
        }
        
        // IMPORTANTE: Forzar actualización de la tabla con los nuevos tramos
        const tablaContainer = document.getElementById('tabla-sii-container');
        if (tablaContainer) {
            // Importar la función si no está disponible
            const { renderTablaTramos } = await import('./iu.view.js');
            
            // Limpiar y re-renderizar la tabla con los tramos actuales
            renderTablaTramos(this.tramosActuales, -1);
            
            // Si la tabla estaba visible, mantenerla visible
            if (!tablaContainer.classList.contains('hidden')) {
                console.log('📊 Actualizando tabla visible con tramos del período', this.periodoActual);
            }
        }
    }

    /**
     * Configura los event listeners
     * CRÍTICO: Solo botón calcular y tecla Enter, NO on-input
     */
    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // Botón calcular: click
        const btnCalcular = document.getElementById('btn-calcular');
        if (btnCalcular) {
            console.log('✅ Botón calcular encontrado');
            btnCalcular.addEventListener('click', () => this.calcular());
        } else {
            console.error('❌ Botón calcular no encontrado');
        }

        // Campo renta: Enter key (keydown event, code 13)
        const inputRenta = document.getElementById('renta-imponible');
        if (inputRenta) {
            console.log('✅ Input renta encontrado');
            
            // Aplicar máscara de miles
            applyThousandsSeparator(inputRenta);
            
            // Listener para Enter
            inputRenta.addEventListener('keydown', (event) => {
                if (event.code === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    console.log('⌨️ Enter presionado');
                    this.calcular();
                }
            });
        } else {
            console.error('❌ Input renta no encontrado');
        }

        // Botón mostrar/ocultar tabla
        const btnMostrarTabla = document.getElementById('btn-mostrar-tabla');
        if (btnMostrarTabla) {
            console.log('✅ Botón tabla encontrado');
            btnMostrarTabla.addEventListener('click', () => this.toggleTabla());
        } else {
            console.error('❌ Botón tabla no encontrado');
        }

        // Escuchar cuando se actualizan los tramos desde el panel admin
        window.addEventListener('tramosActualizados', async (e) => {
            const { mes, anio } = e.detail;
            if (mes === this.periodoActual?.mes && anio === this.periodoActual?.anio) {
                console.log('📊 Recargando tramos actualizados...');
                await this.loadTramos();
            }
        });

        // Listeners para cambio de período
        const mesCalculo = document.getElementById('mes-calculo');
        const anioCalculo = document.getElementById('anio-calculo');

        if (mesCalculo) {
            mesCalculo.addEventListener('change', () => this.onPeriodoChange());
        }

        if (anioCalculo) {
            anioCalculo.addEventListener('change', () => this.onPeriodoChange());
        }
    }

    /**
     * Ejecuta el cálculo del impuesto único
     * CRÍTICO: Solo se ejecuta con botón o Enter
     */
    async calcular() {
        console.log('🧮 Iniciando cálculo...');
        
        if (this.isCalculando) {
            console.log('⏳ Cálculo ya en progreso, ignorando...');
            return;
        }

        try {
            this.isCalculando = true;
            this.view.mostrarCargando(true);

            // 1. Obtener RLI del input
            const rli = this.obtenerRLIDelInput();
            console.log('💰 RLI obtenida:', rli);
            
            if (!isValidRenta(rli)) {
                this.view.mostrarError(ERRORS.INVALID_RENTA);
                return;
            }

            // 2. Verificar que los tramos estén cargados
            if (!this.tramosActuales || this.tramosActuales.length === 0) {
                await this.loadTramos();
                if (!this.tramosActuales || this.tramosActuales.length === 0) {
                    this.view.mostrarError('No se pudieron cargar los tramos. Intente recargar la página.');
                    return;
                }
            }

            // 3. Ejecutar computeImpuestoUnico
            console.log('🔢 Calculando impuesto...');
            const resultado = computeImpuestoUnico(rli, this.tramosActuales);
            console.log('✅ Resultado calculado:', resultado);
            
            // 4. Mostrar resultado
            this.view.renderResultado(resultado);
            
            // 5. Resaltar tramo en tabla
            const indiceAplicado = obtenerIndiceTramoAplicado(rli, this.tramosActuales);
            console.log('📍 Índice tramo aplicado:', indiceAplicado);
            this.view.renderTablaTramos(this.tramosActuales, indiceAplicado);
            
            console.log('✅ Cálculo completado exitosamente');

        } catch (error) {
            console.error('❌ Error en cálculo:', error);
            this.view.mostrarError(error.message || 'Error en el cálculo del impuesto');
        } finally {
            this.isCalculando = false;
            this.view.mostrarCargando(false);
        }
    }

    /**
     * Obtiene la RLI del input y la convierte a número
     * @returns {number} RLI como número
     */
    obtenerRLIDelInput() {
        const input = document.getElementById('renta-imponible');
        if (!input) {
            throw new Error('Campo de renta no encontrado');
        }

        const valor = input.value.trim();
        console.log('📝 Valor del input:', valor);
        
        if (!valor) {
            throw new Error('Debe ingresar un monto de renta');
        }

        // Usar getCleanNumber para obtener el valor numérico
        const rli = getCleanNumber(valor);
        console.log('💱 RLI parseada:', rli);
        
        if (rli <= 0) {
            throw new Error('La renta debe ser mayor a cero');
        }

        return rli;
    }

    /**
     * Alterna la visibilidad de la tabla
     */
    async toggleTabla() {
        console.log('🔄 Alternando tabla...');
        
        // Importar la función si es necesario
        const { toggleTabla, renderTablaTramos } = await import('./iu.view.js');
        
        // Antes de mostrar, asegurar que tenga los tramos correctos del período actual
        const tablaContainer = document.getElementById('tabla-sii-container');
        if (tablaContainer && tablaContainer.classList.contains('hidden')) {
            // Si va a mostrar la tabla, actualizarla con los tramos actuales
            renderTablaTramos(this.tramosActuales, -1);
        }
        
        toggleTabla();
    }

    /**
     * Limpia el resultado actual
     */
    limpiarResultado() {
        console.log('🧹 Limpiando resultado...');
        this.view.limpiarResultado();
        this.view.renderTablaTramos(this.tramosActuales, -1); // Sin resaltar
    }

    /**
     * Obtiene el resultado actual
     * @returns {Object|null} Resultado del cálculo o null
     */
    getResultadoActual() {
        return this.resultadoActual;
    }

    /**
     * Obtiene los tramos cargados
     * @returns {Array|null} Array de tramos o null
     */
    getTramos() {
        return this.tramosActuales;
    }

    /**
     * Valida que todos los elementos necesarios estén presentes
     * @returns {boolean} true si todos los elementos están presentes
     */
    validarElementos() {
        const elementosRequeridos = [
            'renta-imponible',
            'btn-calcular',
            'resultado-iu',
            'btn-mostrar-tabla',
            'tabla-sii-container'
        ];

        let todosPresentes = true;
        for (const id of elementosRequeridos) {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.error(`❌ Elemento requerido no encontrado: ${id}`);
                todosPresentes = false;
            } else {
                console.log(`✅ Elemento encontrado: ${id}`);
            }
        }

        return todosPresentes;
    }
}

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - IU Controller');
    
    // Test de validación de elementos
    const controller = new IUController();
    const elementosValidos = controller.validarElementos();
    console.assert(typeof elementosValidos === 'boolean', 'validarElementos should return boolean');
    
    console.log('✅ Todos los tests de IU Controller pasaron correctamente');
    console.groupEnd();
}