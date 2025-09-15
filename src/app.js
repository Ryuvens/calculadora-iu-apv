/**
 * Archivo principal de la aplicación
 * Conecta todos los módulos y maneja la inicialización
 */

import { IUController } from './features/iu/index.js';

class App {
    constructor() {
        this.iuController = null;
    }

    async init() {
        console.log('🚀 Iniciando aplicación...');
        
        try {
            // Inicializar IU
            this.iuController = new IUController();
            await this.iuController.init();
            
            // Inicializar Panel de Administración
            if (window.adminController) {
                window.adminController.init();
            }
            
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

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});