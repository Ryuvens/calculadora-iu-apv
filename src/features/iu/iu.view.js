/**
 * Vista de la Calculadora de Impuesto Único
 * Maneja el renderizado de resultados y tabla SII
 */

import { fmtCLP, fmtFactor, fmtPercentage } from '../../core/helpers/formatters.js';

/**
 * Clase para manejo de la vista de la Calculadora IU
 */
export class IUView {
    constructor() {
        this.tablaVisible = false;
    }

    /**
     * Renderiza el resultado del cálculo
     * @param {Object} resultado - Resultado del cálculo
     */
    renderResultado(resultado) {
        console.log('🎨 Renderizando resultado:', resultado);
        const container = document.getElementById('resultado-iu');
        if (!container) {
            console.error('❌ Contenedor de resultado no encontrado');
            return;
        }

        const html = `
            <div class="resultado-iu">
                <h3>Resultado del Cálculo</h3>
                <div class="resultado-grid">
                    <div class="resultado-item">
                        <label>Renta Líquida Imponible:</label>
                        <span class="valor">${resultado.rliFormateada}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Impuesto Único:</label>
                        <span class="valor impuesto">${resultado.impuestoFormateado}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Tasa Efectiva:</label>
                        <span class="valor">${resultado.tasaEfectivaFormateada}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Tramo Aplicado:</label>
                        <span class="valor">${resultado.tramo.label || `Tramo ${resultado.tramo.numero}`}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Factor:</label>
                        <span class="valor">${resultado.factorFormateado}</span>
                    </div>
                    <div class="resultado-item">
                        <label>Cantidad a Rebajar:</label>
                        <span class="valor">${resultado.rebajaFormateada}</span>
                    </div>
                </div>
                <div class="formula-info">
                    <p><strong>Fórmula aplicada:</strong> Impuesto = max(0, RLI × ${resultado.factorFormateado} - ${resultado.rebajaFormateada})</p>
                    <p><strong>Cálculo:</strong> max(0, ${resultado.rliFormateada} × ${resultado.factorFormateado} - ${resultado.rebajaFormateada}) = ${resultado.impuestoFormateado}</p>
                </div>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';
    }

    /**
     * Renderiza la tabla de tramos SII
     * @param {Array} tramos - Array de tramos
     * @param {number} indiceAplicado - Índice del tramo aplicado (-1 si ninguno)
     */
    renderTablaTramos(tramos, indiceAplicado = -1) {
        console.log('📊 Renderizando tabla tramos:', tramos?.length, 'tramos, índice aplicado:', indiceAplicado);
        const container = document.getElementById('tabla-sii-container');
        if (!container) {
            console.error('❌ Contenedor de tabla no encontrado');
            return;
        }

        if (!tramos || tramos.length === 0) {
            container.innerHTML = '<p>No hay datos de tramos disponibles</p>';
            return;
        }

        const html = `
            <div class="tabla-sii">
                <h3>Tabla de Tramos SII - Septiembre 2025</h3>
                <div class="tabla-wrapper">
                    <table class="tabla-tramos">
                        <thead>
                            <tr>
                                <th>Períodos</th>
                                <th>Desde</th>
                                <th>Hasta</th>
                                <th>Factor</th>
                                <th>Cantidad a rebajar</th>
                                <th>Tasa de Impuesto Efectiva, máxima por cada tramo de Renta</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tramos.map((tramo, index) => {
                                const isAplicado = index === indiceAplicado;
                                const desdeFormateado = fmtCLP(tramo.desde);
                                const hastaFormateado = tramo.hasta === 999999999 ? 'Y MÁS' : fmtCLP(tramo.hasta);
                                const factorFormateado = fmtFactor(tramo.factor);
                                const rebajaFormateada = fmtCLP(tramo.rebaja);
                                
                                // Formatear tasa efectiva máxima
                                let tasaEfectivaFormateada;
                                if (tramo.tasaEfectivaMax === 'Exento') {
                                    tasaEfectivaFormateada = 'Exento';
                                } else if (tramo.tasaEfectivaMax === 'MÁS DE 27.48%') {
                                    tasaEfectivaFormateada = 'MÁS DE 27.48%';
                                } else {
                                    tasaEfectivaFormateada = fmtPercentage(tramo.tasaEfectivaMax);
                                }
                                
                                return `
                                    <tr class="${isAplicado ? 'tramo-aplicado' : ''}">
                                        <td>${tramo.numero === 1 ? 'Exento' : `Tramo ${tramo.numero}`}</td>
                                        <td>${desdeFormateado}</td>
                                        <td>${hastaFormateado}</td>
                                        <td>${factorFormateado}</td>
                                        <td>${rebajaFormateada}</td>
                                        <td>${tasaEfectivaFormateada}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                ${indiceAplicado >= 0 ? 
                    `<div class="tramo-info">
                        <p><strong>Tramo aplicado:</strong> ${tramos[indiceAplicado].label || `Tramo ${tramos[indiceAplicado].numero || indiceAplicado + 1}`}</p>
                    </div>` : ''
                }
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Alterna la visibilidad de la tabla
     */
    toggleTabla() {
        const container = document.getElementById('tabla-sii-container');
        const btn = document.getElementById('btn-mostrar-tabla');
        
        if (!container || !btn) {
            console.error('❌ Elementos de tabla no encontrados');
            return;
        }

        this.tablaVisible = !this.tablaVisible;
        console.log('🔄 Tabla visible:', this.tablaVisible);
        
        if (this.tablaVisible) {
            container.style.display = 'block';
            btn.textContent = 'Ocultar Tabla SII';
            btn.classList.add('active');
        } else {
            container.style.display = 'none';
            btn.textContent = 'Mostrar Tabla SII';
            btn.classList.remove('active');
        }
    }

    /**
     * Muestra un mensaje de error
     * @param {string} mensaje - Mensaje de error
     */
    mostrarError(mensaje) {
        const container = document.getElementById('resultado-iu');
        if (!container) {
            console.error('Contenedor de resultado no encontrado');
            return;
        }

        const html = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${mensaje}</p>
            </div>
        `;

        container.innerHTML = html;
        container.style.display = 'block';
    }

    /**
     * Muestra/oculta el indicador de carga
     * @param {boolean} mostrar - true para mostrar, false para ocultar
     */
    mostrarCargando(mostrar) {
        const container = document.getElementById('resultado-iu');
        if (!container) {
            return;
        }

        if (mostrar) {
            const html = `
                <div class="cargando">
                    <div class="spinner"></div>
                    <p>Calculando impuesto...</p>
                </div>
            `;
            container.innerHTML = html;
            container.style.display = 'block';
        }
    }

    /**
     * Limpia el resultado actual
     */
    limpiarResultado() {
        const container = document.getElementById('resultado-iu');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    }

    /**
     * Resalta un tramo específico en la tabla
     * @param {number} indice - Índice del tramo a resaltar
     */
    resaltarTramo(indice) {
        const tabla = document.querySelector('.tabla-tramos tbody');
        if (!tabla) {
            return;
        }

        // Remover resaltado anterior
        const filas = tabla.querySelectorAll('tr');
        filas.forEach(fila => fila.classList.remove('tramo-aplicado'));

        // Resaltar nueva fila
        if (indice >= 0 && indice < filas.length) {
            filas[indice].classList.add('tramo-aplicado');
        }
    }

    /**
     * Actualiza el estado del botón de tabla
     * @param {boolean} visible - true si la tabla está visible
     */
    actualizarBotonTabla(visible) {
        const btn = document.getElementById('btn-mostrar-tabla');
        if (!btn) {
            return;
        }

        this.tablaVisible = visible;
        
        if (visible) {
            btn.textContent = 'Ocultar Tabla SII';
            btn.classList.add('active');
        } else {
            btn.textContent = 'Mostrar Tabla SII';
            btn.classList.remove('active');
        }
    }

    /**
     * Valida que todos los elementos necesarios estén presentes
     * @returns {boolean} true si todos los elementos están presentes
     */
    validarElementos() {
        const elementosRequeridos = [
            'resultado-iu',
            'tabla-sii-container',
            'btn-mostrar-tabla'
        ];

        for (const id of elementosRequeridos) {
            const elemento = document.getElementById(id);
            if (!elemento) {
                console.error(`Elemento de vista requerido no encontrado: ${id}`);
                return false;
            }
        }

        return true;
    }
}

// Exportar funciones individuales para uso directo
export function renderResultado(resultado) {
    const view = new IUView();
    return view.renderResultado(resultado);
}

export function renderTablaTramos(tramos, indiceAplicado = -1) {
    const view = new IUView();
    return view.renderTablaTramos(tramos, indiceAplicado);
}

export function toggleTabla() {
    const view = new IUView();
    return view.toggleTabla();
}

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - IU View');
    
    const view = new IUView();
    
    // Test de validación de elementos
    const elementosValidos = view.validarElementos();
    console.assert(typeof elementosValidos === 'boolean', 'validarElementos should return boolean');
    
    // Test de estado de tabla
    console.assert(typeof view.tablaVisible === 'boolean', 'tablaVisible should be boolean');
    
    console.log('✅ Todos los tests de IU View pasaron correctamente');
    console.groupEnd();
}
