# Level-Up Gamer 🎮

## Configuración del Proyecto

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm (viene con Node.js)

### Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/PyKydo/LevelUpGamer.git
cd LevelUpGamer
```

2. Instala las dependencias:

```bash
npm install
```

3. Abre el archivo index.html en tu navegador favorito

### Estructura de Archivos

```
LevelUpGamer/
├── components/         # Componentes reutilizables (header, footer, cards)
├── css/               # Estilos
├── data/             # Archivos JSON con datos
├── img/              # Imágenes
├── js/               # Scripts
└── views/            # Páginas del sitio
```

## Contexto del Proyecto

**Level-Up Gamer** es una tienda online chilena dedicada a la venta de productos para gamers. Surgió hace dos años durante la pandemia y se ha consolidado como un referente en el mercado, ofreciendo consolas, accesorios, computadores, sillas gaming y más. Aunque no tiene ubicación física, realiza despachos a todo Chile.

### Misión y Visión

- **Misión**: Proporcionar productos de alta calidad para gamers en todo Chile, con una experiencia de compra única y personalizada.
- **Visión**: Ser la tienda online líder en productos para gamers en Chile, con un programa de fidelización basado en gamificación.

## Objetivos

Desarrollar una tienda online básica utilizando **HTML**, **CSS** y **JavaScript**. Este proyecto servirá como base para evaluaciones futuras y tiene como objetivo principal dominar:

- La estructura y el diseño web básico.
- La aplicación de estilos propios.
- La validación de formularios.
- La colaboración mediante control de versiones (Git/GitHub).

## Alcance del Proyecto

Todos los requerimientos propuestos deben ser validados por el docente para determinar el alcance final. No todos los requerimientos pueden ser implementados en esta etapa.

## Requisitos del Proyecto

### Requisitos Funcionales (Level-Up Gamer)

- **Registro y Autenticación de Usuarios**:
  - Sistema de registro solo para usuarios mayores de 18 años.
  - Descuento del 20% para usuarios registrados con correos Duoc (@duoc.cl, @profesor.duoc.cl).
- **Gestión de Perfiles de Usuario**: Permitir a los usuarios actualizar su información personal y preferencias.
- **Visualización de Catálogo de Productos**:
  - Mostrar productos categorizados: juegos de mesa, accesorios, consolas, computadores gamers, sillas gamers, mouse, mousepad, poleras personalizadas, polerones gamers personalizados.
  - Implementar filtros avanzados para búsqueda y navegación.
- **Funcionalidad del Carrito de Compras**: Gestión del carrito (agregar, eliminar, modificar productos) con resumen de precios.
- **Programa de Referidos y Gamificación**:
  - Usuarios pueden agregar códigos de referidos al registrarse, ganando puntos LevelUp.
  - Sistema de niveles basado en puntos canjeables por productos y descuentos.
- **Reseñas y Calificaciones**: Permitir a los clientes dejar reseñas y calificar productos comprados.

### Requisitos Técnicos

- **Estructura con HTML**:
  - Usar HTML5 con estructura semántica (etiquetas como `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
  - Implementar hipervínculos funcionales, imágenes, botones, formularios y un footer informativo.
  - Asegurar que todas las páginas estén interconectadas para una navegación coherente.
- **Diseño con CSS**:
  - Crear una hoja de estilos externa y personalizada.
  - Aplicar estilos consistentes y atractivos en todas las páginas.
  - Utilizar selectores y propiedades CSS para personalizar el diseño.
  - Garantizar que el diseño sea responsivo.
- **Validación con JavaScript**:
  - Implementar validaciones en tiempo real para formularios.
  - Mostrar mensajes de error y sugerencias dinámicas.
  - Mejorar la experiencia del usuario mediante feedback claro.
- **Colaboración con GitHub**:
  - Crear un repositorio remoto público en GitHub.
  - Realizar commits con mensajes claros y descriptivos.
  - Distribuir tareas equitativamente entre los miembros del equipo.
  - Integrar cambios de manera efectiva.

### Diseño Visual (Level-Up Gamer)

- **Colores**:
  - Fondo principal: Negro (#000000).
  - Colores de acento: Azul Eléctrico (#1E90FF) y Verde Neón (#39FF14) para botones y elementos interactivos.
- **Tipografía**:
  - Fuente principal: Roboto (para texto general).
  - Fuente de encabezados: Orbitron (futurista).
- **Colores de Texto**:
  - Texto principal: Blanco (#FFFFFF).
  - Texto secundario: Gris Claro (#D3D3D3).

### Información Extra para el Usuario

- Detallar fabricantes y distribuidores de productos para asegurar autenticidad.
- Ofrecer recomendaciones personalizadas basadas en historial de compras.
- Incluir sección de impacto comunitario para destacar cómo las compras apoyan a la comunidad gamer.

## Estructura del Sistema

El proyecto consta de dos partes:

1. **Tienda (pública)**: Vista visible para los usuarios finales.
2. **Administrador**: Sistema de gestión con autenticación y permisos.

## Vistas de la Tienda

### Página Principal

- Logo y nombre de la tienda (Level-Up Gamer).
- Menú de navegación: Home, Productos, Nosotros, Blogs, Contacto.
- Carrito de compras visible.
- Sección de productos destacados.

### Registro de Usuario

- Formulario de registro con validaciones JavaScript (edad mínima 18 años, descuento para correos Duoc).

### Inicio de Sesión

- Formulario de login con validaciones JavaScript.

### Nosotros

- Información sobre la empresa y los desarrolladores.

### Blogs

- Lista de noticias con imagen, título y descripción corta.
- Detalle de blogs: dos ejemplos con imagen, título y descripción extendida.

### Contacto

- Formulario para enviar mensajes con validaciones JavaScript.

### Productos

- Lista de productos con imagen, nombre, precio y botón "Añadir".
- Redirección al detalle del producto al hacer clic.
- Carrito funcional en esta vista y en el detalle.
- Categorías basadas en el catálogo de Level-Up Gamer (ejemplo de productos en tablas below).

#### Ejemplo de Productos

| Código | Categoría              | Nombre                                   | Precio         |
| ------ | ---------------------- | ---------------------------------------- | -------------- |
| JM001  | Juegos de Mesa         | Catan                                    | $29.990 CLP    |
| JM002  | Juegos de Mesa         | Carcassonne                              | $24.990 CLP    |
| AC001  | Accesorios             | Controlador Inalámbrico Xbox Series X    | $59.990 CLP    |
| AC002  | Accesorios             | Auriculares Gamer HyperX Cloud II        | $79.990 CLP    |
| CQ001  | Consolas               | PlayStation 5                            | $549.990 CLP   |
| CG001  | Computadores Gamers    | PC Gamer ASUS ROG Strix                  | $1.299.990 CLP |
| SG001  | Sillas Gamers          | Silla Gamer SecretLab Titan              | $349.990 CLP   |
| MS001  | Mouse                  | Mouse Gamer Logitech G502 HERO           | $49.990 CLP    |
| MP001  | Mousepad               | Mousepad Razer Goliathus Extended Chroma | $29.990 CLP    |
| PP001  | Poleras Personalizadas | Polera Gamer Personalizada 'Level-Up'    | $14.990 CLP    |

### Detalle del Producto

- Información detallada del producto.
- Botón para añadir al carrito.

## Vistas del Administrador

### Home del Administrador

- Menú vertical y contenido central.
- Diseño libre pero con menú visible.

### Mantenedores

- **Productos**: Listar, crear, editar y eliminar productos.
- **Usuarios**: Listar, crear, editar y eliminar usuarios.

## Validaciones con JavaScript

### Registro de Usuario / Crear Usuario (Admin)

- **RUN**: Requerido, validar formato (sin puntos ni guion, entre 7-9 caracteres).
- **Nombre**: Requerido, máximo 50 caracteres.
- **Apellidos**: Requerido, máximo 100 caracteres.
- **Correo**: Requerido, máximo 100 caracteres, solo dominios `@duoc.cl`, `@profesor.duoc.cl`, `@gmail.com`.
- **Fecha de Nacimiento**: Opcional, pero debe asegurar que el usuario sea mayor de 18 años.
- **Tipo de Usuario**: Selector con roles (Administrador, Cliente, Vendedor).
- **Región y Comuna**: Selectores dinámicos (cambian según región seleccionada).
- **Dirección**: Requerido, máximo 300 caracteres.

### Inicio de Sesión

- **Correo**: Requerido, máximo 100 caracteres, dominios permitidos.
- **Contraseña**: Requerido, entre 4 y 10 caracteres.

### Contacto

- **Nombre**: Requerido, máximo 100 caracteres.
- **Correo**: Máximo 100 caracteres, dominios permitidos.
- **Comentario**: Requerido, máximo 500 caracteres.

### Productos y Carrito

- Listar productos desde un arreglo en JavaScript.
- Implementar carrito de compras:
  - Añadir productos.
  - Definir reglas de negocio.
  - Guardar en `localStorage`.

### Validaciones para Producto (Admin)

- **Nombre**: Requerido, máximo 100 caracteres.
- **Descripción**: Opcional, máximo 500 caracteres.
- **Precio**: Requerido, mínimo 0 (gratis), acepta decimales.
- **Stock**: Requerido, mínimo 0, solo enteros.
- **Stock Crítico**: Opcional, mínimo 0, solo enteros.
- **Categorías**: Requerido, selector de categorías.
- **Imagen**: Opcional.

## Roles del Sistema

- **Administrador**: Acceso total al sistema.
- **Vendedor**: Solo puede ver productos y órdenes.
- **Cliente**: Solo accede a la tienda.

## Instrucciones de Entrega

### Partes de la entrega:

1. **Entrega del encargo**: Proyecto frontend y documentos.
2. **Presentación**: Exposición del proyecto y ronda de preguntas.

### Material a entregar:

- Enlace público al repositorio de GitHub del proyecto frontend.
- Archivo comprimido del proyecto frontend.
- Documento ERS (Especificación de Requisitos del Software) en su versión inicial.

### Presentación:

- Cada equipo dispondrá de 15 minutos para presentar el proyecto.
- Se seguirá una ronda de preguntas de 5 minutos por equipo.
- Cada integrante debe estar preparado para responder preguntas técnicas sobre el desarrollo.

## Pauta de Evaluación

La evaluación se basa en una rúbrica con los siguientes niveles de logro:

- **Muy buen desempeño (100%)**: Cumple todos los aspectos de manera destacada.
- **Buen desempeño (80%)**: Cumple con pequeñas omisiones o errores.
- **Desempeño aceptable (60%)**: Cumple los elementos básicos con omisiones o errores.
- **Desempeño incipiente (30%)**: Presenta importantes omisiones o errores.
- **Desempeño no logrado (0%)**: No cumple o lo hace de forma incorrecta.

### Categorías evaluadas:

1. **Estructura y etiquetado HTML (8%)**.
2. **Diseño con CSS (10%)**.
3. **Validaciones con JavaScript (10%)**.
4. **Colaboración en GitHub (12%)**.
5. **Explicación de HTML y semántica (10%)**.
6. **Descripción de CSS y mantenimiento (15%)**.
7. **Demostración de validaciones JavaScript (15%)**.
8. **Justificación de cambios en GitHub (15%)**.

La evaluación total se compone de:

- **Situación evaluativa 1 (Encargo)**: 40% de la nota.
- **Situación evaluativa 2 (Presentación)**: 60% de la nota.
