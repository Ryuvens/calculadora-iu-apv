import { UFUTMService } from './ufutm.service.js';
import { fmtCLP, fmtUF, parseCLP } from '../../core/helpers/index.js';

export class UFUTMConversor {
    constructor() {
        this.service = new UFUTMService();
        this.isOpen = false;
        this.datosCache = {};
    }

    init() {
        this.setupSelectores();
        this.setupEventListeners();
        this.cargarDatosIniciales();
    }

    setupSelectores() {
        // Generar opciones de días para selectores UF
        const selectoresDias = ['uf-clp-dia', 'clp-uf-dia'];
        selectoresDias.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                for (let i = 1; i <= 31; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    if (i === new Date().getDate()) option.selected = true;
                    select.appendChild(option);
                }
            }
        });
    }

    setupEventListeners() {
        // Abrir/cerrar conversor
        const btnAbrir = document.getElementById('btn-conversor');
        const btnCerrar = document.getElementById('btn-cerrar-conversor');
        const panel = document.getElementById('ufutm-conversor');

        if (btnAbrir) {
            btnAbrir.addEventListener('click', () => this.abrir());
        }

        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => this.cerrar());
        }

        // Click fuera para cerrar
        if (panel) {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) this.cerrar();
            });
        }

        // UF → CLP
        const inputUfToClp = document.getElementById('input-uf-to-clp');
        if (inputUfToClp) {
            inputUfToClp.addEventListener('input', () => this.convertirUfToClp());
        }
        // Actualizar cuando cambia la fecha
        ['uf-clp-dia', 'uf-clp-mes', 'uf-clp-anio'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.convertirUfToClp());
        });

        // CLP → UF
        const inputClpToUf = document.getElementById('input-clp-to-uf');
        if (inputClpToUf) {
            inputClpToUf.addEventListener('input', () => this.convertirClpToUf());
        }
        ['clp-uf-dia', 'clp-uf-mes', 'clp-uf-anio'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.convertirClpToUf());
        });

        // UTM → CLP
        const inputUtmToClp = document.getElementById('input-utm-to-clp');
        if (inputUtmToClp) {
            inputUtmToClp.addEventListener('input', () => this.convertirUtmToClp());
        }
        ['utm-clp-mes', 'utm-clp-anio'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.convertirUtmToClp());
        });

        // CLP → UTM
        const inputClpToUtm = document.getElementById('input-clp-to-utm');
        if (inputClpToUtm) {
            inputClpToUtm.addEventListener('input', () => this.convertirClpToUtm());
        }
        ['clp-utm-mes', 'clp-utm-anio'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.convertirClpToUtm());
        });
    }

    async cargarDatosIniciales() {
        // Cargar datos del mes actual
        const fecha = new Date();
        const mes = fecha.getMonth() + 1;
        const anio = fecha.getFullYear();
        
        const datos = await this.service.cargarDatosPeriodo(anio, mes);
        if (datos) {
            const key = `${anio}-${mes}`;
            this.datosCache[key] = datos;
        }
    }

    async obtenerValorUF(dia, mes, anio) {
        const key = `${anio}-${mes}`;
        
        // Cargar datos si no están en cache
        if (!this.datosCache[key]) {
            const datos = await this.service.cargarDatosPeriodo(anio, mes);
            if (datos) {
                this.datosCache[key] = datos;
            }
        }
        
        if (this.datosCache[key] && this.datosCache[key].uf) {
            const fecha = `${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
            return this.datosCache[key].uf[fecha] || null;
        }
        
        return null;
    }

    async obtenerValorUTM(mes, anio) {
        const key = `${anio}-${mes}`;
        
        if (!this.datosCache[key]) {
            const datos = await this.service.cargarDatosPeriodo(anio, mes);
            if (datos) {
                this.datosCache[key] = datos;
            }
        }
        
        return this.datosCache[key]?.utm || null;
    }

    async convertirUfToClp() {
        const input = document.getElementById('input-uf-to-clp');
        const resultado = document.getElementById('resultado-uf-to-clp');
        
        const valor = parseFloat(input.value.replace(',', '.'));
        if (isNaN(valor) || valor <= 0) {
            resultado.value = '';
            return;
        }

        const dia = parseInt(document.getElementById('uf-clp-dia').value);
        const mes = parseInt(document.getElementById('uf-clp-mes').value);
        const anio = parseInt(document.getElementById('uf-clp-anio').value);
        
        const valorUF = await this.obtenerValorUF(dia, mes, anio);
        
        if (valorUF) {
            const resultadoCLP = valor * valorUF;
            resultado.value = fmtCLP(Math.round(resultadoCLP));
        } else {
            resultado.value = 'Sin datos UF';
        }
    }

    async convertirClpToUf() {
        const input = document.getElementById('input-clp-to-uf');
        const resultado = document.getElementById('resultado-clp-to-uf');
        
        const valor = parseCLP(input.value);
        if (isNaN(valor) || valor <= 0) {
            resultado.value = '';
            return;
        }

        const dia = parseInt(document.getElementById('clp-uf-dia').value);
        const mes = parseInt(document.getElementById('clp-uf-mes').value);
        const anio = parseInt(document.getElementById('clp-uf-anio').value);
        
        const valorUF = await this.obtenerValorUF(dia, mes, anio);
        
        if (valorUF) {
            const resultadoUF = valor / valorUF;
            resultado.value = resultadoUF.toFixed(2).replace('.', ',') + ' UF';
        } else {
            resultado.value = 'Sin datos UF';
        }
    }

    async convertirUtmToClp() {
        const input = document.getElementById('input-utm-to-clp');
        const resultado = document.getElementById('resultado-utm-to-clp');
        
        const valor = parseFloat(input.value.replace(',', '.'));
        if (isNaN(valor) || valor <= 0) {
            resultado.value = '';
            return;
        }

        const mes = parseInt(document.getElementById('utm-clp-mes').value);
        const anio = parseInt(document.getElementById('utm-clp-anio').value);
        
        const valorUTM = await this.obtenerValorUTM(mes, anio);
        
        if (valorUTM) {
            const resultadoCLP = valor * valorUTM;
            resultado.value = fmtCLP(Math.round(resultadoCLP));
        } else {
            resultado.value = 'Sin datos UTM';
        }
    }

    async convertirClpToUtm() {
        const input = document.getElementById('input-clp-to-utm');
        const resultado = document.getElementById('resultado-clp-to-utm');
        
        const valor = parseCLP(input.value);
        if (isNaN(valor) || valor <= 0) {
            resultado.value = '';
            return;
        }

        const mes = parseInt(document.getElementById('clp-utm-mes').value);
        const anio = parseInt(document.getElementById('clp-utm-anio').value);
        
        const valorUTM = await this.obtenerValorUTM(mes, anio);
        
        if (valorUTM) {
            const resultadoUTM = valor / valorUTM;
            resultado.value = resultadoUTM.toFixed(4).replace('.', ',') + ' UTM';
        } else {
            resultado.value = 'Sin datos UTM';
        }
    }

    abrir() {
        const panel = document.getElementById('ufutm-conversor');
        if (panel) {
            panel.classList.remove('hidden');
            this.isOpen = true;
        }
    }

    cerrar() {
        const panel = document.getElementById('ufutm-conversor');
        if (panel) {
            panel.classList.add('hidden');
            this.isOpen = false;
        }
    }
}
