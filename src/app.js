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
            
            // Setup navegación
            this.setupTabNavigation();
            
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
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});