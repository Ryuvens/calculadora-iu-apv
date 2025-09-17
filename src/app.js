/**
 * Archivo principal de la aplicación
 * Conecta todos los módulos y maneja la inicialización
 */

import { IUController } from './features/iu/index.js';
import { AdminController } from './features/admin/index.js';

class App {
    constructor() {
        this.iuController = null;
        this.adminController = null;
    }

    async init() {
        console.log('🚀 Iniciando aplicación...');
        
        try {
            // Inicializar IU
            this.iuController = new IUController();
            await this.iuController.init();
            
            // Inicializar Panel Admin
            this.adminController = new AdminController();
            this.adminController.init();
            
            // Inicializar módulo UF/UTM
            const { UFUTMController } = await import('./features/ufutm/ufutm.controller.js');
            this.ufutmController = new UFUTMController();
            await this.ufutmController.init();
            
            // Setup navegación
            this.setupTabNavigation();
            
            // Diagnóstico temporal
            console.log('🔍 Verificando pestañas disponibles:');
            document.querySelectorAll('.tab-content').forEach(tab => {
                console.log(`- ID: ${tab.id}, Classes: ${tab.className}`);
            });

            console.log('🔍 Verificando botones de pestañas:');
            document.querySelectorAll('.tab').forEach(btn => {
                console.log(`- data-tab: ${btn.dataset.tab}, Texto: ${btn.textContent}`);
            });
            
            console.log('✅ Aplicación lista');
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remover active de todos los botones
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Ocultar todo el contenido
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.classList.add('hidden');
                });
                
                // Mostrar el contenido seleccionado
                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.classList.add('active');
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});