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
}
