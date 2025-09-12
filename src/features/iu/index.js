/**
 * Barrel export para el módulo de Impuesto Único
 * Centraliza todas las exportaciones del módulo de cálculo IU
 */

// Exportar clases principales
export { IUController } from './iu.controller.js';
export { computeImpuestoUnico, obtenerIndiceTramoAplicado } from './iu.service.js';
export * from './iu.view.js';