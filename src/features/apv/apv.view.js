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
        // Mostrar secciones de resultados
        const recomendacion = document.getElementById('apv-recomendacion');
        const proyeccion = document.getElementById('apv-proyeccion');
        const tabla = document.getElementById('apv-comparacion-tabla');
        
        if (recomendacion) recomendacion.classList.remove('hidden');
        if (proyeccion) proyeccion.classList.remove('hidden');
        if (tabla) tabla.classList.remove('hidden');
    }

    actualizarRegimenA(datos) {
        const card = document.getElementById('card-regime-a');
        if (!card) return;
        
        const bonifAmount = card.querySelector('.bonif-amount');
        const regimeAnnual = card.querySelector('.regime-annual');
        
        if (bonifAmount) bonifAmount.textContent = `$${datos.bonificacionMensual.toLocaleString('es-CL')}`;
        if (regimeAnnual) regimeAnnual.textContent = `$${datos.bonificacionAnual.toLocaleString('es-CL')}`;
    }

    actualizarRegimenB(datos) {
        const card = document.getElementById('card-regime-b');
        if (!card) return;
        
        const savingsAmount = card.querySelector('.savings-amount');
        const regimeAnnual = card.querySelector('.regime-annual');
        
        if (savingsAmount) savingsAmount.textContent = `$${datos.ahorroMensual.toLocaleString('es-CL')}`;
        if (regimeAnnual) regimeAnnual.textContent = `$${datos.ahorroAnual.toLocaleString('es-CL')}`;
    }

    marcarRecomendacion(regimen) {
        // Remover recomendación de todas las cards
        document.querySelectorAll('.regime-card').forEach(card => {
            card.classList.remove('recommended');
            const badge = card.querySelector('.recommended-badge');
            if (badge) badge.style.display = 'none';
        });
        
        // Marcar la recomendada
        const cardRecomendada = document.getElementById(`card-regime-${regimen.toLowerCase()}`);
        if (cardRecomendada) {
            cardRecomendada.classList.add('recommended');
            const badge = cardRecomendada.querySelector('.recommended-badge');
            if (badge) badge.style.display = 'block';
        }
    }

    actualizarProyeccion(tipo, años, datos) {
        const periodoElement = document.querySelector(`[data-periodo="${años}"]`);
        if (!periodoElement) return;
        
        let content = periodoElement.querySelector('.periodo-content');
        if (!content) {
            content = document.createElement('div');
            content.className = 'periodo-content';
            periodoElement.appendChild(content);
        }
        
        // Generar HTML para la proyección
        const html = `
            <div class="periodo-valores">
                <div class="valor-item">
                    <span class="valor-label">Rentabilidad:</span>
                    <span class="valor-amount">$${datos.rentabilidadGenerada.toLocaleString('es-CL')}</span>
                </div>
                <div class="valor-item">
                    <span class="valor-label">Capital ahorrado:</span>
                    <span class="valor-amount">$${datos.capitalAhorrado.toLocaleString('es-CL')}</span>
                </div>
                <div class="valor-item">
                    <span class="valor-label">Monto de la rebaja de impuestos:</span>
                    <span class="valor-amount">$${datos.beneficioAcumulado.toLocaleString('es-CL')}</span>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }

    actualizarTablaComparativa(datos) {
        const tbody = document.getElementById('tbody-comparacion');
        if (!tbody) return;
        
        const html = `
            <tr>
                <td><strong>Ahorro mensual</strong></td>
                <td>$${datos.sinAPV.ahorroMensual.toLocaleString('es-CL')}</td>
                <td>$${datos.conAPV.ahorroMensual.toLocaleString('es-CL')}</td>
            </tr>
            <tr>
                <td><strong>Sueldo afecto a impuestos</strong></td>
                <td>$${datos.sinAPV.sueldoAfecto.toLocaleString('es-CL')}</td>
                <td>$${datos.conAPV.sueldoAfecto.toLocaleString('es-CL')}</td>
            </tr>
            <tr>
                <td><strong>Impuesto a pagar</strong></td>
                <td>$${datos.sinAPV.impuestoPagar.toLocaleString('es-CL')}</td>
                <td>$${datos.conAPV.impuestoPagar.toLocaleString('es-CL')}</td>
            </tr>
            <tr>
                <td><strong>Ahorro en impuestos</strong></td>
                <td>$${datos.sinAPV.ahorroImpuesto.toLocaleString('es-CL')}</td>
                <td>$${datos.conAPV.ahorroImpuesto.toLocaleString('es-CL')}</td>
            </tr>
            <tr>
                <td><strong>Bonificación fiscal</strong></td>
                <td>$${datos.sinAPV.bonificacionFiscal.toLocaleString('es-CL')}</td>
                <td>$${datos.conAPV.bonificacionFiscal.toLocaleString('es-CL')}</td>
            </tr>
        `;
        
        tbody.innerHTML = html;
    }

    cambiarVistaProyeccion(regime) {
        // Esta función se puede expandir para mostrar diferentes vistas según el régimen
        console.log(`Cambiando vista de proyección a régimen: ${regime}`);
    }

    mostrarError(mensaje) {
        // Crear o actualizar elemento de error
        let errorElement = document.getElementById('apv-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'apv-error';
            errorElement.className = 'error-message';
            
            // Insertar después del botón calcular
            const btnCalcular = document.getElementById('btn-calcular-apv');
            if (btnCalcular) {
                btnCalcular.parentNode.insertBefore(errorElement, btnCalcular.nextSibling);
            }
        }
        
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
        
        // Ocultar después de 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}
