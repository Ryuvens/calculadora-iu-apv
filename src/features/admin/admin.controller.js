import { initAdminForm, mostrarEstadoAdmin, mostrarFormulario, mostrarValidacion } from './admin.view.js';
import { AdminService } from './admin.service.js';
import { fmtCLP, parseCLP } from '../../core/helpers/index.js';

export class AdminController {
    constructor() {
        this.adminService = new AdminService();
        this.periodoActual = null;
        this.datosOriginales = null;
    }

    init() {
        console.log('🔧 Inicializando Panel de Administración...');
        
        // Debug: verificar visibilidad
        const adminTab = document.getElementById('tab-admin');
        console.log('Tab admin element:', adminTab);
        console.log('Tab admin classes:', adminTab?.className);
        console.log('Tab admin hidden?:', adminTab?.classList.contains('hidden'));
        
        console.log('Verificando elementos DOM:');
        console.log('- btn-cargar-periodo:', document.getElementById('btn-cargar-periodo'));
        console.log('- btn-nuevo-periodo:', document.getElementById('btn-nuevo-periodo'));
        console.log('- admin-form-container:', document.getElementById('admin-form-container'));
        
        initAdminForm();
        this.setupEventListeners();
        this.cargarPeriodosGuardados();
        
        console.log('✅ Panel de Administración inicializado');
    }

    setupEventListeners() {
        // Botón cargar período
        const btnCargar = document.getElementById('btn-cargar-periodo');
        if (btnCargar) {
            btnCargar.addEventListener('click', () => this.cargarPeriodo());
        }

        // Botón nuevo período
        const btnNuevo = document.getElementById('btn-nuevo-periodo');
        if (btnNuevo) {
            btnNuevo.addEventListener('click', () => this.nuevoPeriodo());
        }

        // Botón copiar de mes anterior
        const btnCopiar = document.getElementById('btn-copiar-anterior');
        if (btnCopiar) {
            btnCopiar.addEventListener('click', () => this.copiarMesAnterior());
        }

        // Botón limpiar formulario
        const btnLimpiar = document.getElementById('btn-limpiar-form');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => this.limpiarFormulario());
        }

        // Botón validar
        const btnValidar = document.getElementById('btn-validar');
        if (btnValidar) {
            btnValidar.addEventListener('click', () => this.validarDatos());
        }

        // Botón guardar
        const btnGuardar = document.getElementById('btn-guardar-periodo');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarPeriodo());
        }

        // Botón exportar todos
        const btnExportar = document.getElementById('btn-exportar-todos');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => this.exportarTodos());
        }

        // Botón importar
        const btnImportar = document.getElementById('btn-importar-json');
        const fileInput = document.getElementById('file-import-json');
        if (btnImportar && fileInput) {
            btnImportar.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.importarJSON(e));
        }

        // Auto-formateo de inputs monetarios
        this.setupFormateoInputs();
    }

    setupFormateoInputs() {
        // Formatear inputs de desde, hasta y rebaja
        const inputsMonetarios = document.querySelectorAll('.admin-input.desde, .admin-input.hasta, .admin-input.rebaja');
        inputsMonetarios.forEach(input => {
            if (input.readOnly) return;
            
            input.addEventListener('blur', (e) => {
                const valor = parseCLP(e.target.value);
                if (!isNaN(valor) && valor >= 0) {
                    e.target.value = fmtCLP(valor);
                }
            });
        });
    }

    obtenerPeriodoSeleccionado() {
        const mes = document.getElementById('admin-mes').value;
        const anio = document.getElementById('admin-anio').value;
        return { mes: parseInt(mes), anio: parseInt(anio) };
    }

    async cargarPeriodo() {
        const periodo = this.obtenerPeriodoSeleccionado();
        console.log('📂 Cargando período:', periodo);
        
        const datos = await this.adminService.cargarPeriodo(periodo.anio, periodo.mes);
        
        if (datos) {
            this.llenarFormulario(datos);
            mostrarEstadoAdmin(`Período ${periodo.mes}/${periodo.anio} cargado exitosamente`, 'success');
            mostrarFormulario(true);
            this.datosOriginales = datos;
        } else {
            mostrarEstadoAdmin(`No hay datos guardados para ${periodo.mes}/${periodo.anio}`, 'info');
            mostrarFormulario(false);
        }
    }

    nuevoPeriodo() {
        const periodo = this.obtenerPeriodoSeleccionado();
        console.log('📝 Nuevo período:', periodo);
        
        this.limpiarFormulario();
        mostrarFormulario(true);
        mostrarEstadoAdmin(`Creando nuevo período ${periodo.mes}/${periodo.anio}`, 'info');
        this.periodoActual = periodo;
    }

    async copiarMesAnterior() {
        const periodo = this.obtenerPeriodoSeleccionado();
        let mesAnterior = periodo.mes - 1;
        let anioAnterior = periodo.anio;
        
        if (mesAnterior === 0) {
            mesAnterior = 12;
            anioAnterior--;
        }
        
        const datosAnteriores = await this.adminService.cargarPeriodo(anioAnterior, mesAnterior);
        
        if (datosAnteriores) {
            this.llenarFormulario(datosAnteriores);
            mostrarEstadoAdmin(`Datos copiados de ${mesAnterior}/${anioAnterior}. Ajuste los valores necesarios.`, 'success');
        } else {
            mostrarEstadoAdmin(`No hay datos del período anterior (${mesAnterior}/${anioAnterior})`, 'error');
        }
    }

    llenarFormulario(datos) {
        if (!datos || !datos.tramos) return;
        
        datos.tramos.forEach((tramo, index) => {
            const i = index + 1;
            
            // Desde
            const desdeInput = document.getElementById(`desde-${i}`);
            if (desdeInput && !desdeInput.readOnly) {
                desdeInput.value = fmtCLP(tramo.desde);
            }
            
            // Hasta
            const hastaInput = document.getElementById(`hasta-${i}`);
            if (hastaInput) {
                hastaInput.value = tramo.hasta === null || tramo.hasta === 999999999 ? 'Y MÁS' : fmtCLP(tramo.hasta);
            }
            
            // Factor
            const factorInput = document.getElementById(`factor-${i}`);
            if (factorInput) {
                factorInput.value = tramo.factor;
            }
            
            // Rebaja
            const rebajaInput = document.getElementById(`rebaja-${i}`);
            if (rebajaInput) {
                rebajaInput.value = fmtCLP(tramo.rebaja);
            }
            
            // Tasa efectiva máxima
            const tasaInput = document.getElementById(`tasa-${i}`);
            if (tasaInput) {
                if (i === 1) {
                    tasaInput.value = 'Exento';
                } else if (i === 8) {
                    tasaInput.value = tramo.tasaEfectivaMax || 'MÁS DE 27.48%';
                } else {
                    tasaInput.value = tramo.tasaEfectivaMax ? (tramo.tasaEfectivaMax * 100).toFixed(2) : '';
                }
            }
        });
    }

    limpiarFormulario() {
        for (let i = 1; i <= 8; i++) {
            if (i !== 1) { // No limpiar tramo exento
                document.getElementById(`desde-${i}`).value = '';
                document.getElementById(`hasta-${i}`).value = i === 8 ? 'Y MÁS' : '';
            }
            
            if (i !== 1) {
                document.getElementById(`factor-${i}`).value = '';
                document.getElementById(`rebaja-${i}`).value = '';
            }
            
            document.getElementById(`tasa-${i}`).value = i === 1 ? 'Exento' : (i === 8 ? 'MÁS DE 27.48%' : '');
        }
        
        mostrarValidacion([], true);
    }

    obtenerDatosFormulario() {
        const tramos = [];
        
        for (let i = 1; i <= 8; i++) {
            const desde = i === 1 ? 0 : parseCLP(document.getElementById(`desde-${i}`).value);
            const hastaValue = document.getElementById(`hasta-${i}`).value;
            const hasta = hastaValue === 'Y MÁS' || i === 8 ? 999999999 : parseCLP(hastaValue);
            const factor = parseFloat(document.getElementById(`factor-${i}`).value) || 0;
            const rebaja = parseCLP(document.getElementById(`rebaja-${i}`).value) || 0;
            const tasaValue = document.getElementById(`tasa-${i}`).value;
            
            let tasaEfectivaMax = null;
            if (i === 1) {
                tasaEfectivaMax = 0;
            } else if (i === 8) {
                tasaEfectivaMax = null;
            } else if (tasaValue && tasaValue !== '') {
                tasaEfectivaMax = parseFloat(tasaValue) / 100;
            }
            
            tramos.push({
                numero: i,
                periodo: 'MENSUAL',
                desde: desde,
                hasta: hasta,
                factor: factor,
                rebaja: rebaja,
                tasaEfectivaMax: tasaEfectivaMax,
                label: i === 1 ? 'Exento' : (i === 8 ? 'Y MÁS' : null)
            });
        }
        
        return tramos;
    }

    validarDatos() {
        const tramos = this.obtenerDatosFormulario();
        const errores = this.adminService.validarTramos(tramos);
        
        if (errores.length === 0) {
            mostrarValidacion(['Todos los datos son válidos'], true);
            return true;
        } else {
            mostrarValidacion(errores, false);
            return false;
        }
    }

    async guardarPeriodo() {
        if (!this.validarDatos()) {
            mostrarEstadoAdmin('Corrija los errores antes de guardar', 'error');
            return;
        }
        
        const periodo = this.obtenerPeriodoSeleccionado();
        const tramos = this.obtenerDatosFormulario();
        
        const guardado = await this.adminService.guardarPeriodo(periodo.anio, periodo.mes, tramos);
        
        if (guardado) {
            mostrarEstadoAdmin(`Período ${periodo.mes}/${periodo.anio} guardado exitosamente`, 'success');
            this.cargarPeriodosGuardados();
            
            // Notificar al controlador principal para recargar si es el período actual
            window.dispatchEvent(new CustomEvent('tramosActualizados', { 
                detail: { mes: periodo.mes, anio: periodo.anio } 
            }));
        } else {
            mostrarEstadoAdmin('Error al guardar el período', 'error');
        }
    }

    cargarPeriodosGuardados() {
        const periodos = this.adminService.obtenerPeriodosGuardados();
        const container = document.getElementById('admin-periodos-list');
        
        if (!container) return;
        
        if (periodos.length === 0) {
            container.innerHTML = '<p>No hay períodos guardados</p>';
            return;
        }
        
        let html = '<ul>';
        periodos.forEach(p => {
            html += `<li>${p.mes}/${p.anio} 
                     <button class="btn-small" onclick="adminController.eliminarPeriodo(${p.anio}, ${p.mes})">Eliminar</button>
                     </li>`;
        });
        html += '</ul>';
        
        container.innerHTML = html;
    }

    async eliminarPeriodo(anio, mes) {
        if (confirm(`¿Eliminar datos de ${mes}/${anio}?`)) {
            await this.adminService.eliminarPeriodo(anio, mes);
            this.cargarPeriodosGuardados();
            mostrarEstadoAdmin(`Período ${mes}/${anio} eliminado`, 'info');
        }
    }

    exportarTodos() {
        const datos = this.adminService.exportarTodos();
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tramos_sii_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        mostrarEstadoAdmin('Datos exportados exitosamente', 'success');
    }

    async importarJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const datos = JSON.parse(text);
            
            const importados = await this.adminService.importarDatos(datos);
            
            if (importados > 0) {
                mostrarEstadoAdmin(`${importados} períodos importados exitosamente`, 'success');
                this.cargarPeriodosGuardados();
            } else {
                mostrarEstadoAdmin('No se encontraron datos válidos para importar', 'error');
            }
        } catch (error) {
            console.error('Error importando:', error);
            mostrarEstadoAdmin('Error al importar el archivo', 'error');
        }
        
        // Limpiar input
        event.target.value = '';
    }
}

// Hacer disponible globalmente para los botones inline
window.adminController = new AdminController();
