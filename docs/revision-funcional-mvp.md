# Etapa 1 — Revisión funcional y criterios de aceptación

Fecha: 12 de noviembre de 2026. Estado: **en curso; pendiente de acuerdos y aceptación del usuario**.

## Alcance y evidencia

Base de partida: commit `c558211`, con 10 pruebas unitarias y 21 de integración previamente aprobadas. Esa evidencia técnica está en `docs/validation.md`; no se presenta como sustituto de una prueba de interfaz.

En esta revisión se inició una instancia local de la API con una base temporal `zero_inventory_test_review_*`, secretos de sesión independientes y perfiles ficticios de cliente, empleado y administrador. Se usaron productos, dirección y contactos ficticios. La DB habitual no recibió registros de demostración.

La revisión se hizo en navegador a 1440 × 900 y 390 × 844. Las capturas privadas de la sesión se conservan localmente en `.local/functional-evidence/`; no contienen tokens, contraseñas ni personas reales.

Estados:

- **Verificado:** el comportamiento indicado se observó desde la interfaz en esta sesión.
- **Parcial:** existe parte del flujo, pero falta ejecutar o acordar una condición necesaria.
- **Pendiente:** no se ha ejecutado el caso completo; no equivale a un fallo confirmado.
- **No implementado:** la pantalla o acción publicada es provisional.

## Matriz funcional

| ID | Perfil / área | Criterio de aceptación | Resultado de esta sesión |
| --- | --- | --- | --- |
| AUT-01 | Público | Credenciales inválidas mantienen el formulario y muestran un error comprensible | **Verificado:** mensaje de credenciales inválidas |
| AUT-02 | Cliente / empleado / admin | Iniciar sesión y entrar al sistema conservando el rol | **Verificado:** se accedió con los tres perfiles ficticios |
| AUT-03 | Cliente | Cerrar sesión elimina el acceso autenticado | **Verificado:** regreso al formulario de login |
| AUT-04 | Cliente | Un acceso directo al dashboard administrativo se rechaza | **Verificado:** redirección a tienda |
| AUT-05 | Empleado | Un acceso directo a gestión de empleados se rechaza | **Verificado:** redirección a tienda; navegación sin módulos exclusivos de admin |
| AUT-06 | Cuenta | Renovación después de expiración, cambio de contraseña y otros casos de sesión | **Pendiente:** las pruebas anteriores cubren renovación básica; no se ejecutó todo el recorrido de interfaz |
| REG-01 | Público | Registro completo con validación de duplicados y regreso al recorrido de compra | **Pendiente** de revisión de interfaz |
| CAT-01 | Público | Ver catálogo; intentar comprar solicita autenticación | **Verificado** |
| CAT-02 | Cliente | Buscar un producto oculta los que no coinciden | **Verificado:** búsqueda de Vaso QA |
| CAT-03 | Cliente | Un producto sin existencias no permite agregar al carrito | **Verificado:** Shaker QA sin stock y acción deshabilitada |
| CAT-04 | Cliente | Categorías, ordenamiento, filtros y resultados vacíos operan de forma coherente | **Pendiente** de completar las combinaciones |
| CAR-01 | Cliente | Agregar producto, cambiar cantidad y recalcular subtotal | **Verificado:** 2 unidades de 19.000 produjeron total 38.000 |
| CAR-02 | Cliente | Eliminar una línea y vaciar voluntariamente el carrito | **Pendiente** de revisión específica de interfaz |
| CAR-03 | Cliente | Confirmar una compra interna con dirección propia y método disponible | **Verificado:** compra ficticia contra entrega; sin pasarela ni cobro externo |
| CAR-04 | Cliente | La compra confirmada vacía las líneas adquiridas | **Verificado:** estado de carrito vacío |
| PED-01 | Cliente | Ver pedido, monto, método y productos comprados | **Verificado:** pedido 1, 38.000 y detalle de 2 unidades |
| PED-02 | Cliente | Filtrar pedidos por estado/fecha y ordenar resultados | **Pendiente** de revisión completa |
| DIR-01 | Cliente | Ver direcciones propias y señalar la predeterminada | **Verificado:** dirección ficticia marcada como predeterminada |
| DIR-02 | Cliente | Crear, editar, predeterminar y retirar direcciones desde las pantallas | **Pendiente** de revisión completa de interfaz; las restricciones de propiedad ya tienen pruebas API |
| PRO-01 | Empleado | Ver catálogo administrativo y saldo posterior a una venta | **Verificado:** Vaso QA pasó de 10 a 8 |
| PRO-02 | Empleado | El formulario informa campos obligatorios faltantes | **Verificado:** nombre, precio, stock, proveedor y categoría; la ausencia de imagen se comunica por notificación |
| PRO-03 | Admin / empleado | Crear y editar un producto completo con su medio y categorías | **Parcial:** se recorrió la validación; la prueba completa requiere resolver requisitos y autorizar una carga externa |
| PRO-04 | Admin / empleado | Desactivar/reactivar conserva el historial y actualiza la visibilidad de catálogo | **Pendiente** de recorrido de interfaz; eliminación lógica ya cubierta por API |
| INV-01 | Admin / empleado | El inventario muestra el saldo derivado de las operaciones efectuadas | **Verificado:** saldo total 10, con filas 8, 2 y 0 |
| INV-02 | Admin / empleado | Búsqueda, filtros, ajustes y consulta de auditoría son comprensibles | **Pendiente** de completar el recorrido de interfaz. No se implementó un ciclo nuevo de inventario |
| PRV-01 | Empleado | Listar proveedores sin exponer acciones exclusivas de otros roles | **Verificado:** proveedor ficticio visible |
| PRV-02 | Admin / empleado | Crear, editar, desactivar y reactivar proveedor con mensajes correctos | **Pendiente** de revisión completa |
| EMP-01 | Admin | Listar colaboradores y su estado | **Verificado:** empleado ficticio activo |
| EMP-02 | Admin | Crear, editar y cambiar estado de empleado y su acceso asociado | **Pendiente** de revisión completa |
| USU-01 | Admin | Administrar usuarios y roles desde una vista operativa | **No implementado:** `/admin/users` muestra una pantalla provisional y no tiene entrada en el menú |
| REP-01 | Admin | Consultar reportes avanzados funcionales | **No implementado:** `/admin/reports` anuncia disponibilidad futura |
| DAS-01 | Admin | Dashboard carga datos del escenario de prueba | **Verificado:** 1 pedido, 3 productos y 3 usuarios; ingresos aprobados 0 porque el pago sigue pendiente |
| MED-01 | Admin | Listar medios y comunicar ausencia de registros sin errores | **Verificado:** lista vacía; se corrigió la paginación que mostraba 1 / 0 |
| MED-02 | Admin | Crear, editar, desactivar y reproducir medios reales en Cloudinary | **Pendiente:** no se enviaron archivos al proveedor |
| CFG-01 | Cuenta | Datos personales, apariencia y seguridad mantienen permisos y validaciones | **Pendiente** de revisión completa de interfaz |
| NAV-01 | Móvil | El contenido usa el ancho disponible y el menú permite cambiar de módulo | **Verificado tras corrección:** contenido de ~390 px en viewport de 390 px y navegación a proveedores desde el menú |
| NAV-02 | Escritorio | El menú conserva opciones según rol y admite colapsar/expandir | **Verificado:** navegación de roles y control de sidebar |
| NAV-03 | Accesibilidad | Cierre de menú con teclado, regreso del foco y controles identificables | **Verificado para el menú móvil:** Escape oculta el diálogo y devuelve el foco a “Abrir menú de navegación”; no representa una auditoría completa de accesibilidad |
| INI-01 | Cuenta | El acceso desde Home respeta la ruta de inicio del rol | **Verificado para admin y cliente** tras cambiar el CTA a la ruta central: dashboard y tienda, respectivamente |

## Hallazgos y tratamiento

### Corregidos dentro de la etapa 1

| ID | Hallazgo | Cambio |
| --- | --- | --- |
| F-01 | En móvil se ocultaba el sidebar, pero se mantenía su margen de 272 px. El contenido quedaba reducido a ~118 px y no había navegación móvil operativa | Se reservó el margen solo desde el breakpoint de escritorio y se agregó un menú móvil accesible con los enlaces del rol |
| F-02 | Home enviaba a todos los usuarios autenticados a una ruta administrativa de productos | El CTA usa la ruta central que ya resuelve el inicio según rol |
| F-03 | El resumen del pedido titulaba “Estado de pago” a un valor que era el método de pago | Se corrigió el rótulo a “Método de pago” y la concordancia de un producto |
| F-04 | Una lista de medios sin registros mostraba paginación 1 / 0 | Se normalizó el número visible mínimo de páginas a 1 |

### Decisiones de negocio y pendientes

| ID | Prioridad | Situación comprobada | Decisión o trabajo necesario |
| --- | --- | --- | --- |
| D-01 | Alcance | Usuarios/roles y reportes avanzados son vistas provisionales | El usuario debe confirmar si son obligatorios en la primera entrega o si se registran como trabajo posterior |
| D-02 | Alta | El formulario exige proveedor, categoría e imagen; la API admite producto sin proveedor, categorías o imagen | Acordar requisitos y unificar validación y mensajes sin invalidar registros históricos sin respaldo |
| D-03 | Alta | El flujo completo de producto depende de una carga externa | Autorizar una cuenta y un archivo ficticio delimitado para probar Cloudinary; las claves no se comparten en el chat |
| D-04 | Media | La interfaz exige precio mayor que cero; la API admite cero | Confirmar si existen productos gratuitos o registros de precio pendiente |
| D-05 | Media | Ayuda, Ofertas y Notificaciones aparecen como controles sin acciones implementadas en el layout | Definir si se retiran/deshabilitan para el MVP o se les asigna un comportamiento real |
| D-06 | Baja | El catálogo administrativo muestra importes con formato distinto a la tienda | Acordar una presentación monetaria uniforme |
| D-07 | Validación | Registro, CRUD completos y configuración tienen casos de interfaz aún pendientes | Ejecutarlos según la matriz; no clasificarlos como aprobados por tener solo una prueba API |

Las reglas de estados de pedido, fecha efectiva de pago, cancelación y devolución pertenecen a la etapa 3. Esta revisión registra lo observado, sin introducir dichas reglas anticipadamente.

## Validación y limpieza de esta entrega parcial

- `frontend: pnpm typecheck`, `pnpm lint` y `pnpm build`: correctos después de las cuatro correcciones.
- Repetición en navegador: medios vacíos muestra `1 / 1`; el resumen de pedido muestra “Método de pago: Contra entrega” y “1 producto”; el CTA del cliente abre `/tienda`.
- La revisión móvil comprobó documento de 390 px de ancho y contenido de aproximadamente 390 px; el menú conserva las opciones del rol y permite cerrar sesión.
- Evidencia visual de la corrección: `.local/functional-evidence/admin-mobile-navigation-fixed.jpg` y `employee-mobile-fixed.jpg`. Una captura adicional del pedido no pudo guardarse; el rótulo sí se verificó en la interfaz.
- No se cambiaron fuentes del backend ni el esquema. Las 31 pruebas anteriores son la referencia de partida; no se presentan como una ejecución nueva en esta entrega.
- El build conserva un aviso informativo de tiempo en Babel. Durante desarrollo aparecieron avisos de Browserslist y de dimensiones iniciales de gráficos de Recharts; no se observaron errores que impidieran cargar el dashboard, pero queda pendiente completar su revisión adaptable.
- Se cerraron las sesiones ficticias y los procesos de revisión. Se verificó que la base temporal de esta sesión ya no existe. La DB habitual y los contenedores de otros proyectos se conservaron.
- Etapa 2 y pasarela: sin iniciar. Publicación de esta revisión parcial: pendiente; no se integra en `dev` antes de completar y aceptar el alcance correspondiente.

## Condiciones de aceptación

Para cerrar la etapa 1 se necesita:

1. Acordar el alcance obligatorio y los requisitos del catálogo.
2. Completar los casos pendientes que pertenecen a ese alcance.
3. Probar los medios externos con una cuenta y datos de prueba autorizados, si están incluidos.
4. Verificar correcciones sin regresiones en los tamaños y roles acordados.
5. Registrar aceptación del usuario con fecha y observaciones.

Aceptación del usuario: **pendiente**. Inicio de etapa 2: **no autorizado todavía por la condición de secuencia**.
