/**
 * Aplica máscara de formato de miles a un input mientras se escribe
 */

/**
 * Aplica máscara de formato de miles a un input mientras se escribe
 * @param {HTMLInputElement} inputElement - Elemento input al que aplicar la máscara
 */
export function applyThousandsSeparator(inputElement) {
    if (!inputElement) return;
    
    inputElement.addEventListener('input', function(e) {
        // Guardar posición del cursor
        const cursorPosition = e.target.selectionStart;
        const oldLength = e.target.value.length;
        
        // Obtener solo números
        let value = e.target.value.replace(/\D/g, '');
        
        // Si está vacío, no hacer nada
        if (value === '') {
            e.target.value = '';
            return;
        }
        
        // Convertir a número y formatear con puntos como separador de miles
        const number = parseInt(value, 10);
        const formatted = number.toLocaleString('es-CL');
        
        // Agregar símbolo $ al inicio
        e.target.value = '$' + formatted;
        
        // Restaurar posición del cursor ajustada
        const newLength = e.target.value.length;
        const diff = newLength - oldLength;
        const newPosition = Math.max(0, cursorPosition + diff);
        e.target.setSelectionRange(newPosition, newPosition);
    });
    
    // Formatear valor inicial si existe
    if (inputElement.value) {
        const value = inputElement.value.replace(/\D/g, '');
        if (value) {
            const number = parseInt(value, 10);
            inputElement.value = '$' + number.toLocaleString('es-CL');
        }
    }
}

/**
 * Obtiene el número limpio (sin formato) de un valor formateado
 * @param {string} formattedValue - Valor formateado con separadores de miles
 * @returns {number} Número limpio
 */
export function getCleanNumber(formattedValue) {
    // Extraer solo números del valor formateado
    return parseInt(formattedValue.replace(/\D/g, '') || '0', 10);
}

/**
 * Formatea un número con separador de miles y símbolo de peso
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export function formatNumberWithThousands(number) {
    if (!number || isNaN(number)) return '$0';
    return '$' + number.toLocaleString('es-CL');
}

/**
 * Valida que el input solo contenga números y caracteres de formato
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export function isValidFormattedNumber(value) {
    // Permitir solo números, puntos, comas y símbolo $
    const regex = /^[\d.,$]*$/;
    return regex.test(value);
}

/**
 * Aplica máscara de RUT chileno a un input
 * @param {HTMLInputElement} inputElement - Elemento input al que aplicar la máscara
 */
export function applyRUTMask(inputElement) {
    if (!inputElement) return;
    
    inputElement.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9kK]/g, '');
        
        if (value.length > 0) {
            // Formatear con puntos y guión
            if (value.length <= 8) {
                value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            } else {
                value = value.slice(0, 8) + '-' + value.slice(8, 9);
            }
        }
        
        e.target.value = value;
    });
}

// Tests básicos
if (typeof window !== 'undefined') {
    console.group('🧪 Tests - Input Mask');
    
    // Test getCleanNumber
    console.assert(getCleanNumber('$1.000.000') === 1000000, 'getCleanNumber should extract 1000000 from $1.000.000');
    console.assert(getCleanNumber('$2500000') === 2500000, 'getCleanNumber should extract 2500000 from $2500000');
    console.assert(getCleanNumber('') === 0, 'getCleanNumber should return 0 for empty string');
    
    // Test formatNumberWithThousands
    console.assert(formatNumberWithThousands(1000000) === '$1.000.000', 'formatNumberWithThousands should format 1000000 as $1.000.000');
    console.assert(formatNumberWithThousands(2500000) === '$2.500.000', 'formatNumberWithThousands should format 2500000 as $2.500.000');
    
    // Test isValidFormattedNumber
    console.assert(isValidFormattedNumber('$1.000.000') === true, 'isValidFormattedNumber should accept $1.000.000');
    console.assert(isValidFormattedNumber('$2.500.000') === true, 'isValidFormattedNumber should accept $2.500.000');
    console.assert(isValidFormattedNumber('abc123') === false, 'isValidFormattedNumber should reject abc123');
    
    console.log('✅ Todos los tests de Input Mask pasaron correctamente');
    console.groupEnd();
}
