# Calculadora IU con Simulador APV

Una aplicación web integral para el cálculo de Impuesto Único y simulación de Ahorro Previsional Voluntario (APV) en Chile.

## 🎯 Características Principales

- **Calculadora de Impuesto Único**: Cálculos precisos basados en las tablas SII actualizadas
- **Simulador APV**: Proyecciones y análisis de rentabilidad del ahorro previsional voluntario
- **Gestión UF/UTM**: Datos actualizados de Unidad de Fomento y Unidad Tributaria Mensual
- **Interfaz Moderna**: Diseño responsive y fácil de usar

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura **feature-first** para una mejor organización y mantenibilidad:

```
/src
  /features
    /iu           # Módulo de Impuesto Único
    /apv          # Módulo de APV
    /ufutm        # Módulo de gestión UF/UTM
  /core
    /helpers      # Funciones utilitarias
    /storage      # Gestión de localStorage
    /config       # Configuración global
  /shared
    /components   # Componentes reutilizables
/data
  /2025          # Datos de UF/UTM por mes
  /tramos        # Tablas SII por período
/public          # Archivos públicos (HTML, CSS)
```

## 🚀 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript ES6+**: Módulos nativos y funcionalidades modernas
- **Vanilla JS**: Sin frameworks, máximo rendimiento

## 📋 Requisitos

- Navegador web moderno con soporte para ES6 modules
- No requiere instalación de dependencias adicionales

## 🛠️ Instalación y Uso

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd calculadora-iu-apv
   ```

2. Abre el archivo `public/index.html` en tu navegador web

3. ¡Listo! La aplicación está lista para usar

## 📁 Estructura de Archivos

- `public/index.html` - Página principal de la aplicación
- `src/features/` - Módulos de funcionalidades específicas
- `src/core/` - Funcionalidades centrales y utilidades
- `src/shared/` - Componentes reutilizables
- `data/` - Datos de UF/UTM y tablas SII

## 🔧 Desarrollo

Este proyecto está en desarrollo activo. Las funcionalidades se implementarán por fases:

- ✅ **Fase 0**: Estructura base del proyecto
- 🚧 **Fase 1**: Implementación del módulo de Impuesto Único
- 🚧 **Fase 2**: Implementación del simulador APV
- 🚧 **Fase 3**: Gestión de datos UF/UTM
- 🚧 **Fase 4**: Optimizaciones y mejoras

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerir mejoras.

## 📞 Contacto

Para preguntas o soporte, por favor contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para facilitar cálculos tributarios en Chile**
