import { UFUTMService } from './ufutm.service.js';
import { UFUTMView } from './ufutm.view.js';
import { UFUTMGestion } from './ufutm.gestion.js';
import { UFUTMConversor } from './ufutm.conversor.js';
import { fmtCLP } from '../../core/helpers/index.js';

export class UFUTMController {
    constructor() {
        this.service = new UFUTMService();
        this.view = new UFUTMView();
        this.gestion = new UFUTMGestion();
        this.conversor = new UFUTMConversor();
        this.periodoActual = {
            mes: 10,  // Octubre por defecto
            anio: 2025
        };
        this.datosActuales = null;
    }

    async init() {
        console.log('💱 Inicializando módulo UF/UTM...');
        
        this.setupEventListeners();
        this.gestion.init();
        this.conversor.init();
        await this.cargarPeriodoActual();
        
        // Listener para actualizaciones desde el panel de gestión
        window.addEventListener('ufutmActualizado', async (e) => {
            const { mes, anio } = e.detail;
            if (mes === this.periodoActual.mes && anio === this.periodoActual.anio) {
                await this.cargarDatos();
            }
        });
        
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
        console.log('Verificando elementos DOM:');
        console.log('- uf-hoy:', document.getElementById('uf-hoy'));
        console.log('- utm-mes:', document.getElementById('utm-mes'));
        console.log('- tbody-uf-7dias:', document.getElementById('tbody-uf-7dias'));
        
        try {
            const datos = await this.service.cargarDatosPeriodo(
                this.periodoActual.anio, 
                this.periodoActual.mes
            );
            
            console.log('Datos cargados:', datos);
            
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
        console.log('📝 Actualizando vista con datos:', datos);
        
        // Actualizar UF de hoy
        const hoy = new Date();
        const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
        
        let ufHoy = null;
        let fechaUF = fechaHoy;
        
        if (datos.uf && datos.uf[fechaHoy]) {
            ufHoy = datos.uf[fechaHoy];
        } else if (datos.uf) {
            // Buscar el último valor disponible
            const fechasOrdenadas = Object.keys(datos.uf).sort().reverse();
            console.log('Fechas disponibles:', fechasOrdenadas);
            if (fechasOrdenadas.length > 0) {
                fechaUF = fechasOrdenadas[0];
                ufHoy = datos.uf[fechaUF];
            }
        }
        
        console.log('UF a mostrar:', ufHoy, 'para fecha:', fechaUF);
        console.log('UTM a mostrar:', datos.utm);
        
        // Actualizar vista
        this.view.actualizarUFHoy(ufHoy, fechaUF);
        this.view.actualizarUTMMes(datos.utm, this.periodoActual);
        
        // Cargar tabla de últimos 7 días
        if (datos.uf) {
            this.view.actualizarTabla7Dias(datos.uf);
        }
    }

    toggleGestionPanel() {
        this.gestion.abrirPanel();
    }

    toggleConversor() {
        this.conversor.abrir();
    }
}
