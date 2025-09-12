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
        this.tramos = null;
        this.resultadoActual = null;
        this.isCalculando = false;
        
        this.setupEventListeners();
    }

    /**
     * Configura los event listeners
     * CRÍTICO: Solo botón calcular y tecla Enter, NO on-input
     */
    setupEventListeners() {
        // Botón calcular: click
        const btnCalcular = document.getElementById('btn-calcular');
        if (btnCalcular) {
            btnCalcular.addEventListener('click', () => this.calcular());
        }

        // Campo renta: Enter key (keydown event, code 13)
        const inputRenta = document.getElementById('renta-imponible');
        if (inputRenta) {
            inputRenta.addEventListener('keydown', (event) => {
                if (event.code === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    this.calcular();
                }
            });
        }

        // Botón mostrar/ocultar tabla
        const btnMostrarTabla = document.getElementById('btn-mostrar-tabla');
        if (btnMostrarTabla) {
            btnMostrarTabla.addEventListener('click', () => this.toggleTabla());
        }

        // Cargar tramos al inicializar
        this.cargarTramos();
    }

    /**
     * Carga los tramos del período actual
     */
    async cargarTramos() {
        try {
            const periodo = this.obtenerPeriodoActual();
            this.tramos = await getTramosData(periodo.year, periodo.month);
            
            if (this.tramos && this.tramos.length > 0) {
                this.view.renderTablaTramos(this.tramos, -1); // Sin resaltar
                console.log('✅ Tramos cargados correctamente');
            } else {
                throw new Error('No se pudieron cargar los tramos');
            }
        } catch (error) {
            console.error('Error cargando tramos:', error);
            this.view.mostrarError('Error cargando tabla de tramos. Intente recargar la página.');
        }
    }

    /**
     * Ejecuta el cálculo del impuesto único
     * CRÍTICO: Solo se ejecuta con botón o Enter
     */
    async calcular() {
        if (this.isCalculando) {
            return; // Evitar cálculos múltiples simultáneos
        }

        try {
            this.isCalculando = true;
            this.view.mostrarCargando(true);

            // 1. Obtener RLI del input
            const rli = this.obtenerRLIDelInput();
            
            if (!isValidRenta(rli)) {
                this.view.mostrarError(ERRORS.INVALID_RENTA);
                return;
            }

            // 2. Verificar que los tramos estén cargados
            if (!this.tramos || this.tramos.length === 0) {
                await this.cargarTramos();
                if (!this.tramos || this.tramos.length === 0) {
                    this.view.mostrarError('No se pudieron cargar los tramos. Intente recargar la página.');
                    return;
                }
            }

            // 3. Ejecutar computeImpuestoUnico
            this.resultadoActual = computeImpuestoUnico(rli, this.tramos);
            
            // 4. Mostrar resultado
            this.view.renderResultado(this.resultadoActual);
            
            // 5. Resaltar tramo en tabla
            const indiceAplicado = obtenerIndiceTramoAplicado(rli, this.tramos);
            this.view.renderTablaTramos(this.tramos, indiceAplicado);
            
            console.log('✅ Cálculo completado:', this.resultadoActual);

        } catch (error) {
            console.error('Error en cálculo:', error);
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
        
        if (!valor) {
            throw new Error('Debe ingresar un monto de renta');
        }

        // Usar parseCLP para manejar formatos con $ y puntos
        const rli = parseCLP(valor);
        
        if (rli <= 0) {
            throw new Error('La renta debe ser mayor a cero');
        }

        return rli;
    }

    /**
     * Obtiene el período actual
     * @returns {Object} Período con año y mes
     */
    obtenerPeriodoActual() {
        // Por ahora usar septiembre 2025, en el futuro se puede hacer dinámico
        return {
            year: 2025,
            month: 9
        };
    }

    /**
     * Alterna la visibilidad de la tabla
     */
    toggleTabla() {
        this.view.toggleTabla();
    }

    /**
     * Limpia el resultado actual
     */
    limpiarResultado() {
        this.resultadoActual = null;
        this.view.limpiarResultado();
        this.view.renderTablaTramos(this.tramos, -1); // Sin resaltar
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
        return this.tramos;
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

        for (const id of elementosRequeridos) {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.error(`Elemento requerido no encontrado: ${id}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Inicializa el controlador
     * @returns {boolean} true si se inicializó correctamente
     */
    inicializar() {
        console.log('🚀 Inicializando Calculadora IU...');
        
        if (!this.validarElementos()) {
            console.error('❌ Elementos requeridos no encontrados');
            return false;
        }

        console.log('✅ Calculadora IU inicializada correctamente');
        return true;
    }
}

// Instancia singleton del controlador
export const iuController = new IUController();

// Auto-inicializar si estamos en el navegador
if (typeof window !== 'undefined') {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            iuController.inicializar();
        });
    } else {
        iuController.inicializar();
    }
}

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - IU Controller');
    
    // Test de validación de elementos
    const controller = new IUController();
    const elementosValidos = controller.validarElementos();
    console.assert(typeof elementosValidos === 'boolean', 'validarElementos should return boolean');
    
    // Test de obtención de período
    const periodo = controller.obtenerPeriodoActual();
    console.assert(periodo.year === 2025 && periodo.month === 9, 'Período actual should be 2025-09');
    
    console.log('✅ Todos los tests de IU Controller pasaron correctamente');
    console.groupEnd();
}
