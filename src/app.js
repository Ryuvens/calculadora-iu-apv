/**
 * Archivo principal de la aplicación
 * Conecta todos los módulos y maneja la inicialización
 */

import { IUController } from './features/iu/index.js';
import { initializeUFUTMModule } from './features/ufutm/index.js';

class App {
    constructor() {
        this.iuController = null;
    }

    async init() {
        console.log('🚀 Iniciando Calculadora IU...');
        
        try {
            // Inicializar módulo UF/UTM primero
            console.log('📊 Inicializando módulo UF/UTM...');
            await initializeUFUTMModule();
            
            // Inicializar controlador IU
            console.log('🧮 Inicializando controlador IU...');
            this.iuController = new IUController();
            await this.iuController.init();
            
            // Setup navegación por tabs
            this.setupTabNavigation();
            
            console.log('✅ Aplicación iniciada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar:', error);
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remover clase active de todas las pestañas y contenidos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Agregar clase active a la pestaña clickeada
                button.classList.add('active');
                
                // Mostrar el contenido correspondiente
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Exportar para uso global si es necesario
window.App = App;
