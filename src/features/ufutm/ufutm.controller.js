import { UFUTMService } from './ufutm.service.js';
import { UFUTMView } from './ufutm.view.js';
import { fmtCLP } from '../../core/helpers/index.js';

export class UFUTMController {
    constructor() {
        this.service = new UFUTMService();
        this.view = new UFUTMView();
        this.periodoActual = {
            mes: 10,  // Octubre por defecto
            anio: 2025
        };
        this.datosActuales = null;
    }

    async init() {
        console.log('💱 Inicializando módulo UF/UTM...');
        
        this.setupEventListeners();
        await this.cargarPeriodoActual();
        
        console.log('✅ Módulo UF/UTM inicializado');
    }

    setupEventListeners() {
        // Botón cargar período
        const btnCargar = document.getElementById('btn-cargar-ufutm');
        if (btnCargar) {
            btnCargar.addEventListener('click', () => this.cargarPeriodo());
        }

        // Selectores de período
        const mesSelector = document.getElementById('ufutm-mes');
        const anioSelector = document.getElementById('ufutm-anio');
        
        if (mesSelector) {
            mesSelector.value = this.periodoActual.mes;
        }
        if (anioSelector) {
            anioSelector.value = this.periodoActual.anio;
        }

        // Botón gestionar
        const btnGestionar = document.getElementById('btn-gestionar-ufutm');
        if (btnGestionar) {
            btnGestionar.addEventListener('click', () => this.toggleGestionPanel());
        }

        // Botón conversor
        const btnConversor = document.getElementById('btn-conversor');
        if (btnConversor) {
            btnConversor.addEventListener('click', () => this.toggleConversor());
        }
    }

    async cargarPeriodoActual() {
        const hoy = new Date();
        this.periodoActual = {
            mes: hoy.getMonth() + 1,
            anio: hoy.getFullYear()
        };

        // Actualizar selectores
        const mesSelector = document.getElementById('ufutm-mes');
        const anioSelector = document.getElementById('ufutm-anio');
        
        if (mesSelector) mesSelector.value = this.periodoActual.mes;
        if (anioSelector) anioSelector.value = this.periodoActual.anio;

        await this.cargarDatos();
    }

    async cargarPeriodo() {
        const mesSelector = document.getElementById('ufutm-mes');
        const anioSelector = document.getElementById('ufutm-anio');
        
        if (mesSelector && anioSelector) {
            this.periodoActual = {
                mes: parseInt(mesSelector.value),
                anio: parseInt(anioSelector.value)
            };
        }

        await this.cargarDatos();
    }

    async cargarDatos() {
        console.log('📊 Cargando datos UF/UTM para:', this.periodoActual);
        
        try {
            // Intentar cargar desde localStorage primero
            const datos = await this.service.cargarDatosPeriodo(
                this.periodoActual.anio, 
                this.periodoActual.mes
            );
            
            if (datos) {
                this.datosActuales = datos;
                this.actualizarVista(datos);
            } else {
                console.log('No hay datos para el período');
                this.view.mostrarSinDatos();
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.view.mostrarError('Error al cargar datos');
        }
    }

    actualizarVista(datos) {
        // Actualizar UF de hoy
        const hoy = new Date();
        const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        
        let ufHoy = null;
        if (datos.uf && datos.uf[fechaHoy]) {
            ufHoy = datos.uf[fechaHoy];
        } else if (datos.uf) {
            // Buscar el último valor disponible
            const fechasOrdenadas = Object.keys(datos.uf).sort().reverse();
            if (fechasOrdenadas.length > 0) {
                ufHoy = datos.uf[fechasOrdenadas[0]];
            }
        }

        // Actualizar vista
        this.view.actualizarUFHoy(ufHoy, fechaHoy);
        this.view.actualizarUTMMes(datos.utm, this.periodoActual);
        
        // Cargar tabla de últimos 7 días
        if (datos.uf) {
            this.view.actualizarTabla7Dias(datos.uf);
        }
    }

    toggleGestionPanel() {
        const panel = document.getElementById('ufutm-gestion-panel');
        if (panel) {
            panel.classList.toggle('hidden');
        }
    }

    toggleConversor() {
        const conversor = document.getElementById('ufutm-conversor');
        if (conversor) {
            conversor.classList.toggle('hidden');
        }
    }
}
