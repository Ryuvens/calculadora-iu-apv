import { fmtCLP } from '../../core/helpers/index.js';

export class APVView {
    constructor() {
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Link para abrir modal
        const linkParametros = document.getElementById('ver-parametros');
        if (linkParametros) {
            linkParametros.addEventListener('click', (e) => {
                e.preventDefault();
                this.abrirModalParametros();
            });
        }

        // Botón para cerrar modal
        const btnCerrar = document.querySelector('#modal-parametros .modal-close');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', (e) => {
                e.preventDefault();
                this.cerrarModalParametros();
            });
        }

        // Cerrar al hacer click fuera del modal
        const modal = document.getElementById('modal-parametros');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModalParametros();
                }
            });
        }
    }

    abrirModalParametros() {
        const modal = document.getElementById('modal-parametros');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    cerrarModalParametros() {
        const modal = document.getElementById('modal-parametros');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    actualizarParametros(valores) {
        // Actualizar valores en el modal
        const paramUF = document.getElementById('param-uf');
        const paramUTM = document.getElementById('param-utm');
        
        if (paramUF) paramUF.textContent = `$${valores.valorUF.toLocaleString('es-CL')}`;
        if (paramUTM) paramUTM.textContent = `$${valores.valorUTM.toLocaleString('es-CL')}`;
    }

    mostrarResultados() {
        // Mostrar todas las secciones de resultados
        const secciones = ['apv-recomendacion', 'apv-proyeccion', 'apv-comparacion-tabla'];
        secciones.forEach(id => {
            const seccion = document.getElementById(id);
            if (seccion) {
                seccion.classList.remove('hidden');
            }
        });
    }

    actualizarRegimenA(datos, esRecomendado = false) {
        const card = document.getElementById('card-regime-a');
        if (!card) return;

        // Actualizar montos
        const anualAmount = card.querySelector('.regime-annual');
        if (anualAmount) {
            anualAmount.textContent = fmtCLP(datos.bonificacionAnual);
        }

        // Actualizar descripción según si es recomendado o no
        const description = card.querySelector('.regime-description');
        if (description) {
            if (esRecomendado) {
                description.innerHTML = `
                    De acuerdo a tu renta mensual y el monto de ahorro ingresado, 
                    el régimen más adecuado para tus depósitos es el <strong>Régimen A</strong>.<br><br>
                    Este régimen te otorga una Bonificación fiscal por tu ahorro de 
                    <strong>${fmtCLP(datos.bonificacionMensual)}</strong> mensuales 
                    y al año un monto de:
                `;
            } else {
                description.innerHTML = `
                    Este régimen te otorga una Bonificación fiscal por tu ahorro de 
                    <strong>${fmtCLP(datos.bonificacionMensual)}</strong> mensuales 
                    y al año un monto de:
                `;
            }
        }
    }

    actualizarRegimenB(datos, esRecomendado = false) {
        const card = document.getElementById('card-regime-b');
        if (!card) return;

        // Actualizar montos
        const anualAmount = card.querySelector('.regime-annual');
        if (anualAmount) {
            anualAmount.textContent = fmtCLP(datos.ahorroAnual);
        }

        // Actualizar descripción según si es recomendado o no
        const description = card.querySelector('.regime-description');
        if (description) {
            if (esRecomendado) {
                description.innerHTML = `
                    De acuerdo a tu renta mensual y el monto de ahorro ingresado, 
                    el régimen más adecuado para tus depósitos es el <strong>Régimen B</strong>.<br><br>
                    Este régimen te permitirá ahorrar <strong>${fmtCLP(datos.ahorroMensual)}</strong> 
                    en impuestos mensuales y al año un monto de:
                `;
            } else {
                description.innerHTML = `
                    Este régimen te permitirá ahorrar <strong>${fmtCLP(datos.ahorroMensual)}</strong> 
                    en impuestos mensuales y al año un monto de:
                `;
            }
        }
    }

    marcarRecomendacion(regimen) {
        // Remover recomendación previa
        document.querySelectorAll('.regime-card').forEach(card => {
            card.classList.remove('recommended');
            const badge = card.querySelector('.recommended-badge');
            if (badge) badge.remove();
        });

        // Marcar el régimen recomendado
        const cardId = regimen === 'A' ? 'card-regime-a' : 'card-regime-b';
        const card = document.getElementById(cardId);
        
        if (card) {
            card.classList.add('recommended');
            
            // Agregar badge
            const header = card.querySelector('.regime-header');
            if (header && !header.querySelector('.recommended-badge')) {
                const badge = document.createElement('div');
                badge.className = 'recommended-badge';
                badge.textContent = '✓ Recomendado';
                header.appendChild(badge);
            }
        }
    }

    actualizarProyeccion(regimen, periodo, datos) {
        // Buscar el contenedor del período usando el atributo correcto
        const periodoElement = document.querySelector(`.proyeccion-periodo[data-periodo="${periodo}"]`);
        if (!periodoElement) {
            console.warn(`No se encontró elemento para período: ${periodo}`);
            return;
        }

        const content = periodoElement.querySelector('.periodo-content');
        if (!content) return;

        // Determinar el label correcto para el beneficio según el régimen
        const labelBeneficio = regimen === 'A' ? 'Bonificación fiscal acumulada:' : 'Ahorro tributario acumulado:';

        // Crear HTML para los valores
        const html = `
            <div class="periodo-valores">
                <div class="valor-item">
                    <span class="valor-label">Rentabilidad:</span>
                    <span class="valor-amount">${fmtCLP(datos.rentabilidadGenerada)}</span>
                </div>
                <div class="valor-item">
                    <span class="valor-label">Capital ahorrado:</span>
                    <span class="valor-amount">${fmtCLP(datos.capitalAhorrado)}</span>
                </div>
                <div class="valor-item">
                    <span class="valor-label">${labelBeneficio}</span>
                    <span class="valor-amount">${fmtCLP(datos.beneficioAcumulado)}</span>
                </div>
            </div>
        `;

        content.innerHTML = html;

        // Guardar datos para diferentes vistas de régimen
        content.dataset[`regimen${regimen}`] = JSON.stringify(datos);
    }

    cambiarVistaProyeccion(regimeSeleccionado) {
        // Implementar cambio de vista según el tab seleccionado
        const periodos = document.querySelectorAll('.proyeccion-periodo');
        
        periodos.forEach(periodo => {
            const content = periodo.querySelector('.periodo-content');
            if (!content) return;

            if (regimeSeleccionado === 'comparacion') {
                // Mostrar comparación lado a lado
                const datosA = content.dataset.regimenA ? JSON.parse(content.dataset.regimenA) : null;
                const datosB = content.dataset.regimenB ? JSON.parse(content.dataset.regimenB) : null;
                
                if (datosA && datosB) {
                    content.innerHTML = this.generarHTMLComparacion(datosA, datosB);
                }
            } else {
                // Mostrar solo el régimen seleccionado
                const datos = content.dataset[`regimen${regimeSeleccionado.toUpperCase()}`];
                if (datos) {
                    const datosParsed = JSON.parse(datos);
                    content.innerHTML = this.generarHTMLRegimen(datosParsed);
                }
            }
        });
    }

    generarHTMLRegimen(datos) {
        return `
            <div class="periodo-valores">
                <div class="valor-item">
                    <span class="valor-label">Rentabilidad:</span>
                    <span class="valor-amount">${fmtCLP(datos.rentabilidadGenerada)}</span>
                </div>
                <div class="valor-item">
                    <span class="valor-label">Capital ahorrado:</span>
                    <span class="valor-amount">${fmtCLP(datos.capitalAhorrado)}</span>
                </div>
                <div class="valor-item">
                    <span class="valor-label">Beneficio tributario acumulado:</span>
                    <span class="valor-amount">${fmtCLP(datos.beneficioAcumulado)}</span>
                </div>
            </div>
        `;
    }

    generarHTMLComparacion(datosA, datosB) {
        return `
            <div class="comparacion-regimenes">
                <div class="comparacion-columna">
                    <h5>Régimen A</h5>
                    <div class="periodo-valores">
                        <div class="valor-item">
                            <span class="valor-label">Rentabilidad:</span>
                            <span class="valor-amount">${fmtCLP(datosA.rentabilidadGenerada)}</span>
                        </div>
                        <div class="valor-item">
                            <span class="valor-label">Capital ahorrado:</span>
                            <span class="valor-amount">${fmtCLP(datosA.capitalAhorrado)}</span>
                        </div>
                        <div class="valor-item">
                            <span class="valor-label">Bonificación total:</span>
                            <span class="valor-amount">${fmtCLP(datosA.beneficioAcumulado)}</span>
                        </div>
                    </div>
                </div>
                <div class="comparacion-columna">
                    <h5>Régimen B</h5>
                    <div class="periodo-valores">
                        <div class="valor-item">
                            <span class="valor-label">Rentabilidad:</span>
                            <span class="valor-amount">${fmtCLP(datosB.rentabilidadGenerada)}</span>
                        </div>
                        <div class="valor-item">
                            <span class="valor-label">Capital ahorrado:</span>
                            <span class="valor-amount">${fmtCLP(datosB.capitalAhorrado)}</span>
                        </div>
                        <div class="valor-item">
                            <span class="valor-label">Ahorro tributario:</span>
                            <span class="valor-amount">${fmtCLP(datosB.beneficioAcumulado)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    actualizarTablaComparativa(datos) {
        const tbody = document.getElementById('tbody-comparacion');
        if (!tbody) return;

        const html = `
            <tr>
                <td>Ahorro mensual</td>
                <td>${fmtCLP(datos.sinAPV.ahorroMensual)}</td>
                <td>${fmtCLP(datos.conAPV.ahorroMensual)}</td>
            </tr>
            <tr>
                <td>Tu sueldo mensual afecto a impuestos</td>
                <td>${fmtCLP(datos.sinAPV.sueldoAfecto)}</td>
                <td>${fmtCLP(datos.conAPV.sueldoAfecto)}</td>
            </tr>
            <tr>
                <td>Impuesto a pagar mensual</td>
                <td>${fmtCLP(datos.sinAPV.impuestoPagar)}</td>
                <td>${fmtCLP(datos.conAPV.impuestoPagar)}</td>
            </tr>
            <tr>
                <td>Ahorro en impuesto mensual</td>
                <td>${fmtCLP(datos.sinAPV.ahorroImpuesto)}</td>
                <td>${fmtCLP(datos.conAPV.ahorroImpuesto)}</td>
            </tr>
            <tr>
                <td>Bonificación Fiscal mensual</td>
                <td>${fmtCLP(datos.sinAPV.bonificacionFiscal)}</td>
                <td>${fmtCLP(datos.conAPV.bonificacionFiscal)}</td>
            </tr>
        `;

        tbody.innerHTML = html;

        // Resaltar diferencias
        this.resaltarDiferencias(tbody);
    }

    resaltarDiferencias(tbody) {
        const filas = tbody.querySelectorAll('tr');
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            if (celdas.length === 3) {
                const sinAPV = celdas[1].textContent;
                const conAPV = celdas[2].textContent;
                
                if (sinAPV !== conAPV) {
                    celdas[2].style.fontWeight = 'bold';
                    celdas[2].style.color = 'var(--success-color)';
                }
            }
        });
    }

    actualizarParametros(parametros) {
        // Actualizar valores en el modal
        const paramUF = document.getElementById('param-uf');
        const paramUTM = document.getElementById('param-utm');
        const paramRentabilidad = document.getElementById('param-rentabilidad');
        
        if (paramUF) paramUF.textContent = fmtCLP(Math.round(parametros.valorUF));
        if (paramUTM) paramUTM.textContent = fmtCLP(Math.round(parametros.valorUTM));
        if (paramRentabilidad) {
            paramRentabilidad.textContent = `${(parametros.rentabilidadAnual * 100).toFixed(3)}%`;
        }
    }

    mostrarError(mensaje) {
        // Crear toast de error
        const existingToast = document.querySelector('.toast-error');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-error';
        toast.textContent = mensaje;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    limpiarResultados() {
        // Ocultar secciones de resultados
        const secciones = ['apv-recomendacion', 'apv-proyeccion', 'apv-comparacion-tabla'];
        secciones.forEach(id => {
            const seccion = document.getElementById(id);
            if (seccion) {
                seccion.classList.add('hidden');
            }
        });
    }
}
