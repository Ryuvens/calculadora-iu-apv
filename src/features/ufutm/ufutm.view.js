import { fmtCLP } from '../../core/helpers/index.js';

export class UFUTMView {
    constructor() {
        this.meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    }

    actualizarUFHoy(valor, fecha) {
        console.log('🔄 Actualizando UF Hoy:', valor, fecha);
        const container = document.getElementById('uf-hoy');
        if (!container) {
            console.error('No se encontró contenedor uf-hoy');
            return;
        }

        const valorEl = container.querySelector('.valor-numero');
        const fechaEl = container.querySelector('.valor-fecha');
        
        console.log('Elementos encontrados:', valorEl, fechaEl);

        if (valor) {
            valorEl.textContent = fmtCLP(valor);
            fechaEl.textContent = this.formatearFecha(fecha);
        } else {
            valorEl.textContent = 'Sin datos';
            fechaEl.textContent = '--';
        }
    }

    actualizarUTMMes(valor, periodo) {
        console.log('🔄 Actualizando UTM:', valor, periodo);
        const container = document.getElementById('utm-mes');
        if (!container) {
            console.error('No se encontró contenedor utm-mes');
            return;
        }

        const valorEl = container.querySelector('.valor-numero');
        const periodoEl = container.querySelector('.valor-periodo');
        
        console.log('Elementos encontrados:', valorEl, periodoEl);

        if (valor) {
            valorEl.textContent = fmtCLP(valor);
            periodoEl.textContent = `${this.meses[periodo.mes]} ${periodo.anio}`;
        } else {
            valorEl.textContent = 'Sin datos';
            periodoEl.textContent = '--';
        }
    }

    actualizarTabla7Dias(datosUF) {
        const tbody = document.getElementById('tbody-uf-7dias');
        if (!tbody) return;

        // Obtener últimos 7 días con datos
        const fechasOrdenadas = Object.keys(datosUF).sort().reverse().slice(0, 7);
        
        let html = '';
        let valorAnterior = null;

        fechasOrdenadas.reverse().forEach(fecha => {
            const valor = datosUF[fecha];
            let variacion = '--';
            
            if (valorAnterior) {
                const diff = valor - valorAnterior;
                const pct = (diff / valorAnterior * 100).toFixed(2);
                const signo = diff > 0 ? '+' : '';
                variacion = `${signo}${pct}%`;
            }

            html += `
                <tr>
                    <td>${this.formatearFecha(fecha)}</td>
                    <td>${fmtCLP(valor)}</td>
                    <td class="${valor > valorAnterior ? 'positivo' : valor < valorAnterior ? 'negativo' : ''}">${variacion}</td>
                </tr>
            `;

            valorAnterior = valor;
        });

        tbody.innerHTML = html || '<tr><td colspan="3">Sin datos disponibles</td></tr>';
    }

    formatearFecha(fecha) {
        if (!fecha) return '--';
        const partes = fecha.split('-');
        if (partes.length !== 3) return fecha;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    mostrarSinDatos() {
        this.actualizarUFHoy(null, null);
        this.actualizarUTMMes(null, { mes: 0, anio: 0 });
        
        const tbody = document.getElementById('tbody-uf-7dias');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="3">Sin datos para este período</td></tr>';
        }
    }

    mostrarError(mensaje) {
        console.error(mensaje);
        // Podríamos mostrar un toast o mensaje en la UI
    }
}
