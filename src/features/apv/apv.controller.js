import { APVService } from './apv.service.js';
import { APVView } from './apv.view.js';
import { parseCLP } from '../../core/helpers/index.js';

export class APVController {
    constructor() {
        this.service = new APVService();
        this.view = new APVView();
        this.resultadosActuales = null;
        this.regimenSeleccionado = 'comparar';
    }

    async init() {
        console.log('💰 Inicializando módulo APV...');
        
        // Inicializar service con valores actuales
        await this.service.init();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Actualizar valores de parámetros en el modal
        this.actualizarParametrosModal();
        
        console.log('✅ Módulo APV inicializado');
    }

    setupEventListeners() {
        // Botón calcular
        const btnCalcular = document.getElementById('btn-calcular-apv');
        if (btnCalcular) {
            btnCalcular.addEventListener('click', () => this.calcular());
        }

        // Radio buttons de régimen
        const radiosRegimen = document.querySelectorAll('input[name="regimen-apv"]');
        radiosRegimen.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.regimenSeleccionado = e.target.value;
                if (this.resultadosActuales) {
                    this.actualizarVista();
                }
            });
        });

        // Tabs de proyección
        const tabsProyeccion = document.querySelectorAll('.proj-tab');
        tabsProyeccion.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.cambiarTabProyeccion(e.target.dataset.regime);
            });
        });

        // Toggles de períodos con delegación de eventos
        const proyeccionContent = document.getElementById('proyeccion-content');
        if (proyeccionContent) {
            proyeccionContent.addEventListener('click', (e) => {
                // Detectar click en header o toggle
                const header = e.target.closest('.periodo-header');
                if (header) {
                    const periodo = header.closest('.proyeccion-periodo');
                    if (periodo) {
                        this.togglePeriodo(periodo);
                    }
                }
            });
        }

        // Formateo de inputs monetarios
        this.setupFormateoInputs();
    }

    setupFormateoInputs() {
        const inputRenta = document.getElementById('renta-liquida');
        const inputAPV = document.getElementById('monto-apv');
        
        [inputRenta, inputAPV].forEach(input => {
            if (input) {
                // Formatear al perder el foco
                input.addEventListener('blur', (e) => {
                    const valor = parseCLP(e.target.value);
                    if (!isNaN(valor) && valor > 0) {
                        e.target.value = `$${valor.toLocaleString('es-CL')}`;
                    }
                });
                
                // Limpiar formato al enfocar
                input.addEventListener('focus', (e) => {
                    const valor = parseCLP(e.target.value);
                    if (!isNaN(valor) && valor > 0) {
                        e.target.value = valor;
                    }
                });
            }
        });
    }

    async calcular() {
        console.log('📊 Calculando beneficios APV...');
        
        // Obtener valores de entrada
        const rentaLiquida = parseCLP(document.getElementById('renta-liquida').value);
        const montoAPV = parseCLP(document.getElementById('monto-apv').value);
        
        // Validar entradas
        if (!this.validarEntradas(rentaLiquida, montoAPV)) {
            return;
        }
        
        try {
            // Realizar cálculos según régimen seleccionado
            let resultados;
            
            if (this.regimenSeleccionado === 'comparar') {
                resultados = this.service.compararRegimenes(rentaLiquida, montoAPV);
            } else if (this.regimenSeleccionado === 'a') {
                resultados = {
                    regimenA: this.service.calcularRegimenA(montoAPV),
                    regimenB: null,
                    recomendacion: 'A'
                };
            } else {
                resultados = {
                    regimenA: null,
                    regimenB: this.service.calcularRegimenB(rentaLiquida, montoAPV),
                    recomendacion: 'B'
                };
            }
            
            // Guardar resultados
            this.resultadosActuales = resultados;
            
            // Actualizar vista
            this.actualizarVista();
            
            console.log('✅ Cálculo completado:', resultados);
            
        } catch (error) {
            console.error('❌ Error en el cálculo:', error);
            this.view.mostrarError('Error al realizar el cálculo');
        }
    }

    validarEntradas(rentaLiquida, montoAPV) {
        const errores = [];
        
        if (!rentaLiquida || rentaLiquida <= 0) {
            errores.push('Ingrese una remuneración válida');
        }
        
        if (!montoAPV || montoAPV <= 0) {
            errores.push('Ingrese un monto de APV válido');
        }
        
        // Validar que el APV no sea mayor que la renta
        if (montoAPV > rentaLiquida) {
            errores.push('El monto de APV no puede ser mayor que la remuneración');
        }
        
        if (errores.length > 0) {
            this.view.mostrarError(errores.join('. '));
            return false;
        }
        
        return true;
    }

    actualizarVista() {
        if (!this.resultadosActuales) return;
        
        const { regimenA, regimenB, recomendacion } = this.resultadosActuales;
        
        // Mostrar secciones ocultas
        this.view.mostrarResultados();
        
        // Actualizar cards de régimen
        if (regimenA) {
            this.view.actualizarRegimenA(regimenA);
        }
        if (regimenB) {
            this.view.actualizarRegimenB(regimenB);
        }
        
        // Marcar régimen recomendado
        if (this.regimenSeleccionado === 'comparar') {
            this.view.marcarRecomendacion(recomendacion);
        }
        
        // Actualizar proyecciones
        this.actualizarProyecciones();
        
        // Actualizar tabla comparativa
        this.actualizarTablaComparativa();
    }

    actualizarProyecciones() {
        // Cambiar los períodos para incluir correctamente el anual
        const periodos = [
            { años: 1, atributo: 'anual' },
            { años: 5, atributo: '5' },
            { años: 10, atributo: '10' },
            { años: 15, atributo: '15' },
            { años: 20, atributo: '20' }
        ];
        
        const regimenes = [];
        
        if (this.resultadosActuales.regimenA) {
            regimenes.push({ tipo: 'A', datos: this.resultadosActuales.regimenA });
        }
        if (this.resultadosActuales.regimenB) {
            regimenes.push({ tipo: 'B', datos: this.resultadosActuales.regimenB });
        }
        
        regimenes.forEach(({ tipo, datos }) => {
            periodos.forEach(({ años, atributo }) => {
                const proyeccion = this.service.calcularProyecciones(datos, años);
                this.view.actualizarProyeccion(tipo, atributo, proyeccion);
            });
        });
    }

    actualizarTablaComparativa() {
        // Evitar recálculo si no hay resultados
        if (!this.resultadosActuales) return;
        
        const rentaLiquida = parseCLP(document.getElementById('renta-liquida').value);
        const montoAPV = parseCLP(document.getElementById('monto-apv').value);
        
        // Validar antes de generar tabla
        if (!rentaLiquida || !montoAPV) return;
        
        // Generar datos para la tabla
        let datosTabla;
        if (this.regimenSeleccionado === 'comparar' || this.regimenSeleccionado === 'b') {
            datosTabla = this.service.generarTablaComparativa(rentaLiquida, montoAPV, 'B');
        } else {
            datosTabla = this.service.generarTablaComparativa(rentaLiquida, montoAPV, 'A');
        }
        
        this.view.actualizarTablaComparativa(datosTabla);
    }

    cambiarTabProyeccion(regime) {
        // Actualizar tabs activos
        document.querySelectorAll('.proj-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.proj-tab[data-regime="${regime}"]`).classList.add('active');
        
        // Actualizar contenido de proyecciones
        this.view.cambiarVistaProyeccion(regime);
    }

    togglePeriodo(periodoElement) {
        if (!periodoElement) return;
        
        const content = periodoElement.querySelector('.periodo-content');
        const toggle = periodoElement.querySelector('.periodo-toggle');
        
        if (!content || !toggle) {
            console.error('No se encontró content o toggle');
            return;
        }
        
        // Verificar estado actual
        const isHidden = content.style.display === 'none' || content.classList.contains('hidden');
        
        if (isHidden) {
            // Expandir
            content.style.display = 'block';
            content.classList.remove('hidden');
            toggle.textContent = '▼';
            periodoElement.classList.remove('collapsed');
            console.log('Expandiendo período');
        } else {
            // Colapsar
            content.style.display = 'none';
            content.classList.add('hidden');
            toggle.textContent = '▶';
            periodoElement.classList.add('collapsed');
            console.log('Colapsando período');
        }
    }

    actualizarParametrosModal() {
        const parametros = this.service.getParametros();
        this.view.actualizarParametros(parametros);
    }

    // Método para actualizar parámetros personalizados (futuro)
    actualizarParametrosPersonalizados(nuevosParametros) {
        this.service.setParametros(nuevosParametros);
        this.actualizarParametrosModal();
        
        // Recalcular si hay resultados
        if (this.resultadosActuales) {
            this.calcular();
        }
    }
}
