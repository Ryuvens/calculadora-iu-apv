/**
 * Vista del Panel de Administración
 */

export function initAdminForm() {
    const tbody = document.getElementById('admin-tramos-body');
    if (!tbody) return;
    
    // Generar 8 filas para los tramos
    let html = '';
    for (let i = 1; i <= 8; i++) {
        const isExento = i === 1;
        const isLast = i === 8;
        
        html += `
            <tr data-tramo="${i}">
                <td>${isExento ? 'Exento' : `Tramo ${i}`}</td>
                <td>
                    <input type="text" 
                           id="desde-${i}" 
                           class="admin-input desde" 
                           placeholder="${isExento ? '0' : 'Desde'}"
                           ${isExento ? 'readonly value="0"' : ''}>
                </td>
                <td>
                    <input type="text" 
                           id="hasta-${i}" 
                           class="admin-input hasta" 
                           placeholder="${isLast ? 'Y MÁS' : 'Hasta'}">
                </td>
                <td>
                    <input type="text" 
                           id="factor-${i}" 
                           class="admin-input factor" 
                           placeholder="${isExento ? '0.0000' : 'Factor'}"
                           ${isExento ? 'value="0.0000"' : ''}>
                </td>
                <td>
                    <input type="text" 
                           id="rebaja-${i}" 
                           class="admin-input rebaja" 
                           placeholder="${isExento ? '0' : 'Rebaja'}"
                           ${isExento ? 'value="0"' : ''}>
                </td>
                <td>
                    <input type="text" 
                           id="tasa-${i}" 
                           class="admin-input tasa" 
                           placeholder="${isExento ? 'Exento' : isLast ? 'MÁS DE X%' : 'Tasa %'}">
                </td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
}

export function mostrarEstadoAdmin(mensaje, tipo = 'info') {
    const estadoEl = document.getElementById('admin-estado');
    if (!estadoEl) return;
    
    estadoEl.className = `admin-estado ${tipo}`;
    estadoEl.textContent = mensaje;
    estadoEl.style.display = 'block';
}

export function mostrarFormulario(show = true) {
    const formContainer = document.getElementById('admin-form-container');
    if (formContainer) {
        if (show) {
            formContainer.classList.remove('hidden');
        } else {
            formContainer.classList.add('hidden');
        }
    }
}

export function mostrarValidacion(mensajes, esValido) {
    const validacionEl = document.getElementById('admin-validacion');
    if (!validacionEl) return;
    
    if (!mensajes || mensajes.length === 0) {
        validacionEl.style.display = 'none';
        return;
    }
    
    const tipo = esValido ? 'success' : 'error';
    const iconClass = esValido ? 'check' : 'warning';
    
    let html = `<div class="validacion-${tipo}">`;
    html += `<h4>${esValido ? '✅ Validación Exitosa' : '⚠️ Errores de Validación'}</h4>`;
    html += '<ul>';
    mensajes.forEach(msg => {
        html += `<li>${msg}</li>`;
    });
    html += '</ul></div>';
    
    validacionEl.innerHTML = html;
    validacionEl.style.display = 'block';
}

export function cargarDatosEnFormulario(tramos) {
    if (!tramos || !Array.isArray(tramos)) return;
    
    tramos.forEach((tramo, index) => {
        const numeroTramo = index + 1;
        
        // Cargar datos en los inputs
        const desdeInput = document.getElementById(`desde-${numeroTramo}`);
        const hastaInput = document.getElementById(`hasta-${numeroTramo}`);
        const factorInput = document.getElementById(`factor-${numeroTramo}`);
        const rebajaInput = document.getElementById(`rebaja-${numeroTramo}`);
        const tasaInput = document.getElementById(`tasa-${numeroTramo}`);
        
        if (desdeInput) desdeInput.value = tramo.desde || '';
        if (hastaInput) hastaInput.value = tramo.hasta || '';
        if (factorInput) factorInput.value = tramo.factor || '';
        if (rebajaInput) rebajaInput.value = tramo.rebaja || '';
        if (tasaInput) tasaInput.value = tramo.tasaEfectivaMax || '';
    });
}

export function obtenerDatosDelFormulario() {
    const tramos = [];
    
    for (let i = 1; i <= 8; i++) {
        const desdeInput = document.getElementById(`desde-${i}`);
        const hastaInput = document.getElementById(`hasta-${i}`);
        const factorInput = document.getElementById(`factor-${i}`);
        const rebajaInput = document.getElementById(`rebaja-${i}`);
        const tasaInput = document.getElementById(`tasa-${i}`);
        
        const tramo = {
            numero: i,
            desde: desdeInput ? parseFloat(desdeInput.value) || 0 : 0,
            hasta: hastaInput ? parseFloat(hastaInput.value) || null : null,
            factor: factorInput ? parseFloat(factorInput.value) || 0 : 0,
            rebaja: rebajaInput ? parseFloat(rebajaInput.value) || 0 : 0,
            tasaEfectivaMax: tasaInput ? tasaInput.value : ''
        };
        
        tramos.push(tramo);
    }
    
    return tramos;
}

export function limpiarFormulario() {
    for (let i = 1; i <= 8; i++) {
        const desdeInput = document.getElementById(`desde-${i}`);
        const hastaInput = document.getElementById(`hasta-${i}`);
        const factorInput = document.getElementById(`factor-${i}`);
        const rebajaInput = document.getElementById(`rebaja-${i}`);
        const tasaInput = document.getElementById(`tasa-${i}`);
        
        // Limpiar todos los inputs excepto el primer tramo (exento)
        if (i === 1) {
            if (desdeInput) desdeInput.value = '0';
            if (factorInput) factorInput.value = '0.0000';
            if (rebajaInput) rebajaInput.value = '0';
            if (tasaInput) tasaInput.value = 'Exento';
        } else {
            if (desdeInput) desdeInput.value = '';
            if (hastaInput) hastaInput.value = '';
            if (factorInput) factorInput.value = '';
            if (rebajaInput) rebajaInput.value = '';
            if (tasaInput) tasaInput.value = '';
        }
    }
}

export function mostrarPeriodosGuardados(periodos) {
    const container = document.getElementById('admin-periodos-list');
    if (!container) return;
    
    if (!periodos || periodos.length === 0) {
        container.innerHTML = '<p>No hay períodos guardados</p>';
        return;
    }
    
    let html = '<div class="periodos-grid">';
    periodos.forEach(periodo => {
        html += `
            <div class="periodo-item">
                <h4>${periodo.mes}/${periodo.anio}</h4>
                <p>Tramos: ${periodo.tramos ? periodo.tramos.length : 0}</p>
                <div class="periodo-actions">
                    <button class="btn-small" onclick="cargarPeriodo('${periodo.id}')">Cargar</button>
                    <button class="btn-small btn-danger" onclick="eliminarPeriodo('${periodo.id}')">Eliminar</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}
