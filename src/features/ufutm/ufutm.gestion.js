import { UFUTMService } from './ufutm.service.js';
import { parseCLP } from '../../core/helpers/index.js';

export class UFUTMGestion {
    constructor() {
        this.service = new UFUTMService();
        this.periodoActual = null;
        this.isOpen = false;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Abrir panel - SOLO con el botón correcto
        const btnGestionar = document.getElementById('btn-gestionar-ufutm');
        if (btnGestionar) {
            btnGestionar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.abrirPanel();
            });
        }

        // Cerrar panel - asegurar que funcione
        const btnCerrar = document.getElementById('btn-cerrar-gestion');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.cerrarPanel();
            });
        }
        
        // Cerrar al hacer click fuera del panel
        const panel = document.getElementById('ufutm-gestion-panel');
        if (panel) {
            // Click en el overlay (fuera del contenido)
            panel.addEventListener('click', (e) => {
                if (e.target === panel) {
                    this.cerrarPanel();
                }
            });
        }

        // Cargar datos
        const btnCargar = document.getElementById('btn-cargar-datos-ufutm');
        if (btnCargar) {
            btnCargar.addEventListener('click', () => this.cargarDatos());
        }

        // Validar y guardar
        const btnValidar = document.getElementById('btn-validar-ufutm');
        const btnGuardar = document.getElementById('btn-guardar-ufutm');

        if (btnValidar) {
            btnValidar.addEventListener('click', () => this.validarDatos());
        }

        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarDatos());
        }

        // Formateo automático UTM
        const inputUTM = document.getElementById('input-utm');
        if (inputUTM) {
            inputUTM.addEventListener('blur', (e) => {
                const valor = parseCLP(e.target.value);
                if (!isNaN(valor) && valor > 0) {
                    e.target.value = `$${valor.toLocaleString('es-CL')}`;
                }
            });
        }
    }

    abrirPanel() {
        const panel = document.getElementById('ufutm-gestion-panel');
        if (panel) {
            panel.classList.remove('hidden');
            this.isOpen = true;
            console.log('📂 Panel de gestión UF/UTM abierto');
        }
    }

    cerrarPanel() {
        console.log('🔒 Cerrando panel de gestión');
        const panel = document.getElementById('ufutm-gestion-panel');
        if (panel) {
            panel.classList.add('hidden');
            this.isOpen = false;
            console.log('Panel cerrado, clases:', panel.className);
        } else {
            console.error('No se encontró el panel');
        }
    }

    async cargarDatos() {
        const mes = parseInt(document.getElementById('gestion-ufutm-mes').value);
        const anio = parseInt(document.getElementById('gestion-ufutm-anio').value);
        
        console.log(`📊 Cargando datos para ${mes}/${anio}`);
        
        const datos = await this.service.cargarDatosPeriodo(anio, mes);
        
        if (datos) {
            // Cargar UTM
            const inputUTM = document.getElementById('input-utm');
            if (inputUTM && datos.utm) {
                inputUTM.value = `$${datos.utm.toLocaleString('es-CL')}`;
            }

            // Cargar UF con decimales
            const textareaUF = document.getElementById('textarea-uf');
            if (textareaUF && datos.uf) {
                let texto = '';
                Object.keys(datos.uf).sort().forEach(fecha => {
                    const valor = datos.uf[fecha];
                    // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY
                    const [year, month, day] = fecha.split('-');
                    // Formatear valor con 2 decimales usando coma
                    const valorFormateado = valor.toFixed(2).replace('.', ',');
                    texto += `${day}/${month}/${year} ${valorFormateado}\n`;
                });
                textareaUF.value = texto.trim();
            }

            this.mostrarMensaje('Datos cargados exitosamente', 'success');
        } else {
            this.mostrarMensaje('No hay datos guardados para este período', 'info');
        }
    }

    validarDatos() {
        const errores = [];
        
        // Validar UTM
        const inputUTM = document.getElementById('input-utm');
        const utm = parseCLP(inputUTM.value);
        
        if (!utm || utm <= 0) {
            errores.push('UTM debe ser mayor a 0');
        }

        // Validar UF
        const textareaUF = document.getElementById('textarea-uf');
        const lineasUF = textareaUF.value.trim().split('\n');
        
        if (lineasUF.length === 0 || !textareaUF.value.trim()) {
            errores.push('Debe ingresar valores de UF');
        } else {
            const ufData = this.parsearUF(textareaUF.value);
            if (Object.keys(ufData).length === 0) {
                errores.push('Formato de UF incorrecto. Use: DD/MM/YYYY valor');
            }
        }

        if (errores.length === 0) {
            this.mostrarMensaje('✅ Datos válidos', 'success');
            return true;
        } else {
            this.mostrarMensaje('❌ Errores: ' + errores.join(', '), 'error');
            return false;
        }
    }

    async guardarDatos() {
        if (!this.validarDatos()) {
            return;
        }

        const mes = parseInt(document.getElementById('gestion-ufutm-mes').value);
        const anio = parseInt(document.getElementById('gestion-ufutm-anio').value);
        const utm = parseCLP(document.getElementById('input-utm').value);
        const ufData = this.parsearUF(document.getElementById('textarea-uf').value);

        const datos = {
            periodo: { anio, mes },
            utm: utm,
            uf: ufData,
            source: 'manual',
            lastUpdate: new Date().toISOString()
        };

        const guardado = await this.service.guardarDatosPeriodo(anio, mes, datos);
        
        if (guardado) {
            this.mostrarMensaje(`✅ Período ${mes}/${anio} guardado exitosamente`, 'success');
            
            // Cerrar panel después de 2 segundos
            setTimeout(() => {
                this.cerrarPanel();
            }, 2000);
            
            // Notificar para actualizar la vista principal
            window.dispatchEvent(new CustomEvent('ufutmActualizado', { 
                detail: { mes, anio } 
            }));
        } else {
            this.mostrarMensaje('❌ Error al guardar', 'error');
        }
    }

    parsearUF(texto) {
        const ufData = {};
        const lineas = texto.trim().split('\n');
        
        lineas.forEach(linea => {
            // Formatos aceptados: 
            // DD/MM/YYYY valor (con punto o coma decimal)
            // DD-MM-YYYY valor
            // YYYY-MM-DD valor
            
            // Primero reemplazar coma por punto para decimales
            const lineaNormalizada = linea.replace(',', '.');
            
            const match = lineaNormalizada.match(/(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{2,4})\s+(\d+\.?\d*)/);
            
            if (match) {
                let dia, mes, anio;
                
                // Detectar formato
                if (match[1].length === 4) {
                    // Formato YYYY-MM-DD
                    anio = match[1];
                    mes = match[2].padStart(2, '0');
                    dia = match[3].padStart(2, '0');
                } else {
                    // Formato DD/MM/YYYY
                    dia = match[1].padStart(2, '0');
                    mes = match[2].padStart(2, '0');
                    anio = match[3].length === 2 ? '20' + match[3] : match[3];
                }
                
                const fecha = `${anio}-${mes}-${dia}`;
                const valor = parseFloat(match[4]);
                
                if (!isNaN(valor)) {
                    // Mantener los decimales
                    ufData[fecha] = Math.round(valor * 100) / 100; // Redondear a 2 decimales
                    console.log(`Parseado: ${fecha} = ${ufData[fecha]}`);
                }
            }
        });
        
        return ufData;
    }

    mostrarMensaje(mensaje, tipo) {
        const container = document.getElementById('gestion-mensajes');
        if (container) {
            container.className = `mensajes ${tipo}`;
            container.textContent = mensaje;
            container.style.display = 'block';
            
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        }
    }
}
