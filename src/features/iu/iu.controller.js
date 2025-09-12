/**
 * Controlador de la Calculadora de Impuesto Único
 * Maneja la lógica de negocio y control de ejecución
 */

import { computeImpuestoUnico, obtenerIndiceTramoAplicado } from './iu.service.js';
import { getTramosData } from '../ufutm/index.js';
import { IUView } from './iu.view.js';
import { ERRORS } from '../../core/config/constants.js';
import { isValidRenta } from '../../core/helpers/validators.js';
import { parseCLP } from '../../core/helpers/formatters.js';

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
            console.log('📊 Cargando tramos...');
            this.tramosActuales = await getTramosData(2025, 9);
            
            if (this.tramosActuales && this.tramosActuales.length > 0) {
                console.log('✅ Tramos cargados:', this.tramosActuales.length, 'tramos');
                // Renderizar tabla inicial sin resaltar
                this.view.renderTablaTramos(this.tramosActuales, -1);
            } else {
                throw new Error('No se pudieron cargar los tramos');
            }
        } catch (error) {
            console.error('❌ Error cargando tramos:', error);
            this.view.mostrarError('Error cargando tabla de tramos. Intente recargar la página.');
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

        // Usar parseCLP para manejar formatos con $ y puntos
        const rli = parseCLP(valor);
        console.log('💱 RLI parseada:', rli);
        
        if (rli <= 0) {
            throw new Error('La renta debe ser mayor a cero');
        }

        return rli;
    }

    /**
     * Alterna la visibilidad de la tabla
     */
    toggleTabla() {
        console.log('🔄 Alternando tabla...');
        this.view.toggleTabla();
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