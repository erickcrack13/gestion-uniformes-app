# Blueprint: Sistema de Gestión de Uniformes

## Visión General

Crear una aplicación web integral para la gestión de un negocio de venta de uniformes. La aplicación incluirá una página de bienvenida profesional, una sección para la **gestión de inventario** (añadir, editar, eliminar, buscar y ordenar productos) y una sección para la **gestión de clientes** (CRUD de clientes). A futuro, los datos se sincronizarán en tiempo real con Firebase.

## Diseño y Estilo

### Página Principal (Landing Page)
*   **Layout:** Diseño de "héroe" seguido de productos destacados y secciones de valor.
*   **Tipografía:** 'Roboto'.
*   **Estilo:** Profesional y atractivo, enfocado en la marca.

### Páginas de Gestión (Inventario y Clientes)
*   **Paleta de Colores:** Primario (`#4A90E2`), Secundario (`#50E3C2`), Peligro (`#E94E77`).
*   **Tipografía:** 'Segoe UI' o una fuente sans-serif moderna.
*   **Layout:** Limpio y funcional, basado en tarjetas, con controles (búsqueda, filtros, botones) accesibles.
*   **Fondo:** Textura de ruido sutil para un acabado premium.
*   **Efectos Visuales:** Sombras suaves, animaciones de entrada y modales para una experiencia de usuario fluida.

## Funcionalidades Implementadas

*   **v0.1 - v0.4:** Estructura inicial del proyecto, CRUD de productos con datos locales, búsqueda y ordenamiento.
*   **v0.5:** Reestructuración a múltiples páginas: `index.html` (bienvenida) e `inventory.html` (inventario).
*   **v0.6:** Se añadió la sección de "Productos Destacados" en la página principal y se implementó un sistema de tasa de cambio USD-VES.
*   **v0.7:** **Gestión de Clientes.** Se añadió una nueva sección (`clients.html`) con funcionalidad CRUD completa para gestionar clientes, incluyendo búsqueda, edición y eliminación. Se implementó una barra de navegación global.

## Plan de Desarrollo Actual

**Próximo Gran Paso: Integración con Firebase**

El objetivo es migrar la gestión de datos locales (tanto productos como clientes) a una base de datos en la nube para que la información sea persistente y se pueda acceder desde cualquier lugar.

1.  **Configurar Firebase:**
    *   Crear un proyecto en Firebase.
    *   Añadir los scripts del SDK de Firebase a todas las páginas (`index.html`, `inventory.html`, `clients.html`).
    *   Crear un archivo `firebase-config.js` para centralizar la configuración de la conexión.

2.  **Refactorizar `inventory.js`:**
    *   Conectar a Firestore.
    *   Reemplazar el array de productos local con listeners de Firestore (`onSnapshot`) para leer y actualizar la colección de `products` en tiempo real.
    *   Adaptar las funciones de Crear, Actualizar y Eliminar para que operen sobre Firestore.

3.  **Refactorizar `clients.js`:**
    *   Conectar a Firestore.
    *   Reemplazar el array de clientes local con listeners de Firestore para la colección de `clients`.
    *   Adaptar las funciones CRUD de clientes para que operen sobre Firestore.
