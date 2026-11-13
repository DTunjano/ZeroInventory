# Etapa 1 — Revisión funcional y criterios de aceptación

Fecha: 12 de noviembre de 2026. Estado: **todos los casos funcionales verificados; aceptación final del usuario pendiente**.

## Alcance y evidencia

Base de partida: commit `c558211`, con 10 pruebas unitarias y 21 de integración previamente aprobadas. Esa evidencia técnica está en `docs/validation.md`; no se presenta como sustituto de una prueba de interfaz.

En esta revisión se iniciaron varias sesiones locales de API, cada una con una base temporal `zero_inventory_test_review_*`, secretos de sesión independientes y perfiles ficticios de cliente, empleado y administrador. Se usaron productos, dirección y contactos ficticios. La DB habitual no recibió registros de demostración.

La revisión acumulada se hizo en navegador a 1440 × 900, 1280 × 720 y 390 × 844. Las capturas privadas de la sesión se conservan localmente en `.local/functional-evidence/`; no contienen tokens, contraseñas ni personas reales.

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
| AUT-06 | Cuenta | Expiración, renovación y cambio de contraseña | **Verificado por API e interfaz:** token expirado rechazado y cookie renueva sesión. El usuario completó el cambio desde Configuración → Seguridad y confirmó «Prueba realizada»; el agente comprobó rechazo de la anterior (401), acceso con la nueva (201) y repitió ambos inicios desde UI |
| REG-01 | Público | Registro completo, duplicados y regreso a compra | **Verificado:** contraseñas distintas y usuario duplicado informados; cuenta ficticia entra a tienda. API prueba registro concurrente sin cuentas huérfanas |
| CAT-01 | Público | Ver catálogo; intentar comprar solicita autenticación | **Verificado** |
| CAT-02 | Cliente | Buscar un producto oculta los que no coinciden | **Verificado:** búsqueda de Vaso QA |
| CAT-03 | Cliente | Un producto sin existencias no permite agregar al carrito | **Verificado:** Shaker QA sin stock y acción deshabilitada |
| CAT-04 | Cliente | Categorías, ordenamiento, filtros y resultados vacíos  | **Verificado tras corrección:** categorías, búsqueda vacía y limpieza; comparación visual de nombre y stock en ambas direcciones con Cuchara/Shaker/Vaso QA, incluyendo agotados. El orden explícito ya no se sustituye por prioridad de disponibilidad; cinco regresiones automáticas |
| CAR-01 | Cliente | Agregar producto, cambiar cantidad y recalcular subtotal | **Verificado:** 2 unidades de 19.000 produjeron total 38.000 |
| CAR-02 | Cliente | Eliminar una línea y vaciar voluntariamente el carrito | **Verificado:** ambos recorridos terminaron en carrito vacío |
| CAR-03 | Cliente | Confirmar una compra interna con dirección propia y método disponible | **Verificado:** compra ficticia contra entrega; sin pasarela ni cobro externo |
| CAR-04 | Cliente | La compra confirmada vacía las líneas adquiridas | **Verificado:** estado de carrito vacío |
| PED-01 | Cliente | Ver pedido, monto, método y productos comprados | **Verificado:** pedido 1, 38.000 y detalle de 2 unidades |
| PED-02 | Cliente | Filtrar pedidos por estado/fecha y ordenar | **Verificado estado/fecha desde UI:** pagados vacío, fecha futura vacía, limpiar recupera pedido. API comprueba orden por monto, fecha final inclusiva, propiedad y rechazo de filtros inválidos |
| DIR-01 | Cliente | Ver direcciones propias y señalar la predeterminada | **Verificado:** dirección ficticia marcada como predeterminada |
| DIR-02 | Cliente | Crear, editar, predeterminar y retirar direcciones | **Verificado desde UI:** alta, edición de referencia, segunda dirección predeterminada y retirada de la primera; propiedad y conservación cuando hay pedidos cubiertas por API |
| PRO-01 | Empleado | Ver catálogo administrativo y saldo posterior a una venta | **Verificado:** Vaso QA pasó de 10 a 8 |
| PRO-02 | Admin / empleado | El formulario informa campos obligatorios faltantes | **Verificado:** proveedor, categoría, nombre, stock y precio positivo; imagen opcional tras la decisión del usuario |
| PRO-03 | Admin / empleado | Crear y editar producto con imagen opcional | **Verificado:** altas/ediciones sin imagen; PNG QA autorizado cargado a Cloudinary y renderizado en navegador (32×32). Reemplazos y compensación de errores verificados con dobles de prueba |
| PRO-04 | Admin / empleado | Desactivar/reactivar conserva historial y actualiza catálogo | **Verificado:** desactivar Cuchara QA la oculta en tienda; reactivar la muestra de nuevo. Saldo e historial tienen pruebas API |
| INV-01 | Admin / empleado | El inventario muestra el saldo derivado de las operaciones efectuadas | **Verificado:** saldo total 10, con filas 8, 2 y 0 |
| INV-02 | Admin / empleado | Búsqueda, filtros, ajuste manual y auditoría | **Verificado:** Agotado limita a Shaker QA; búsqueda Vaso; ajuste de Cuchara 1→2 desde Productos, auditoría AUMENTO, filtro REDUCCION vacío y limpiar recupera fila. Sin implementar ciclo nuevo de inventario |
| PRV-01 | Empleado | Listar proveedores sin exponer acciones exclusivas de otros roles | **Verificado:** proveedor ficticio visible |
| PRV-02 | Admin / empleado | Crear, editar, desactivar y reactivar proveedores | **Verificado:** alta aparece sin recarga tras corrección; edición de titular; desactivar/reactivar; repetir eliminación lógica conserva inactivo; filtro Inactivos y trazabilidad numérica comprobados |
| EMP-01 | Admin | Listar colaboradores y su estado | **Verificado:** empleado ficticio activo |
| EMP-02 | Admin | Crear, editar y cambiar estado con acceso asociado | **Verificado desde UI:** alta con cuenta, edición de nombre, filtro inactivo y reactivación. API comprueba login/rol, atomicidad y rollback ante conflicto de cuenta o último ADMIN |
| USU-01 | Admin | Administrar usuarios y roles desde una vista operativa | **Verificado:** alta, edición de roles, búsqueda, filtro inactivo, desactivación/reactivación y rechazo del último admin desde UI; contraseñas, perfiles y concurrencia mediante integración API |
| REP-01 | Admin | Consultar reportes avanzados funcionales  | **Implementado y verificado:** consulta exclusiva ADMIN, rango <=366 días, resumen/día/estado/método/productos/inventario, CSV descargado con cifras comprobadas, período vacío y rango excesivo; temas claro/oscuro y móvil. Ver `docs/reportes.md` |
| DAS-01 | Admin | Dashboard carga datos del escenario de prueba | **Verificado:** 1 pedido, 3 productos y 3 usuarios; ingresos aprobados 0 porque el pago sigue pendiente |
| MED-01 | Admin | Listar medios y comunicar ausencia de registros sin errores | **Verificado:** lista vacía; se corrigió la paginación que mostraba 1 / 0 |
| MED-02 | Admin | Crear, editar, desactivar y reproducir videos promocionales  | **Verificado con video real autorizado:** MP4 ficticio de 2 s y 320×180, carga vía API, reproducción real en Home, edición desde UI, desactivación/ocultación y reactivación desde UI. Recurso QA retirado y ausencia remota comprobada; medios anteriores conservados. Lectura pública de inactivo por ID devuelve 404, con integración |
| CFG-01 | Cuenta | Perfil, apariencia y seguridad respetan permisos  | **Verificado:** perfil persistido, claro/oscuro funcionales por cuenta tras recarga/inicio de sesión; empleado solo ve Apariencia. Cambio de contraseña realizado personalmente por el usuario y verificado con rechazo de la anterior y acceso con la nueva, por API e interfaz |
| NAV-01 | Móvil | El contenido usa el ancho disponible y el menú permite cambiar de módulo | **Verificado tras corrección:** contenido de ~390 px en viewport de 390 px y navegación a proveedores desde el menú |
| NAV-02 | Escritorio | El menú conserva opciones según rol y admite colapsar/expandir | **Verificado:** navegación de roles y control de sidebar |
| NAV-03 | Accesibilidad | Cierre de menú con teclado, regreso del foco y controles identificables | **Verificado para el menú móvil:** Escape oculta el diálogo y devuelve el foco a “Abrir menú de navegación”; no representa una auditoría completa de accesibilidad |
| INI-01 | Cuenta | El acceso desde Home respeta la ruta de inicio del rol | **Verificado para admin y cliente** tras cambiar el CTA a la ruta central: dashboard y tienda, respectivamente |

## Resultado vigente del cierre técnico

Esta sección y la matriz anterior reflejan el estado actual. Las rondas descritas más abajo conservan su evidencia histórica; sus limitaciones fueron superadas solo donde la matriz lo indica expresamente.

- REP-01 se incorporó por la petición posterior de completar pendientes. Reportes no modifica negocio ni estados: consulta de solo lectura con snapshot consistente, totales independientes y exportación protegida contra fórmulas.
- Tema claro habilitado y corregido en pantallas operativas, etiquetas, modales y controles. Tailwind carga la configuración semántica; la variante oscura sigue la cuenta, no la preferencia del SO. Home/acceso/registro mantienen su marca oscura.
- Catálogo de cliente: nombre ascendente Cuchara/Shaker/Vaso, descendente Vaso/Shaker/Cuchara; stock ascendente Shaker/Cuchara/Vaso y descendente Vaso/Cuchara/Shaker. Se corrigió la prioridad que desplazaba agotados aunque hubiera un orden explícito.
- Video: carga real autorizada de 57.919 bytes vía API temporal; reproducción de 2 s, 320×180, readyState 4, sin error y tiempo de reproducción avanzando. Edición y alternancia desde UI; inactivo ausente de Home. Limpieza autorizada completada con 404 remoto. No se alteraron medios anteriores.
- Contrastes y anchos comprobados en reportes, catálogo e inventario; pedidos del cliente revisados en claro. Reportes claro/oscuro a 390 px, documento sin desbordamiento; menú Escape devuelve el foco. Empleado carece de enlaces administrativos y solo configura apariencia.
- Backend: tipos, lint, build y 24 unitarias. Integración: 38 pruebas PostgreSQL aisladas (ver última ejecución en `docs/validation.md`). Frontend: tipos, lint, build y 7 unitarias de CSV/orden. Sin migraciones nuevas. DB habitual: cero pendientes, diferencias de stock y duplicados.
- Evidencias privadas: `reports-light-validated.jpg`, `reports-mobile-light-validated.jpg`, `reports-mobile-dark-validated.jpg`, `customer-catalog-sorting-validated.jpg`, `customer-store-mobile-light-validated.jpg`, `cloudinary-video-playback-validated.jpg`, `password-ui-handoff.jpg` en `.local/functional-evidence`.

### Prueba personal completada de AUT-06 / CFG-01

La política de control del navegador exige que el usuario introduzca y confirme una nueva contraseña. El usuario realizó el cambio en Configuración → Seguridad con la cuenta ficticia `qa_customer` y confirmó «Prueba realizada». Las credenciales de QA se entregaron únicamente en el chat; no se usan en instalaciones habituales. El recorrido completado fue:

1. El usuario introdujo contraseña actual, nueva y confirmación en la cuenta de QA.
2. Guardó y confirmó los cambios; después informó «Prueba realizada».
3. El agente verificó rechazo de la anterior y acceso con la nueva, y retiró la DB temporal.

Solo resta que el usuario revise la matriz y apruebe la etapa o indique ajustes. No se requieren SQL, Git, Docker ni pruebas técnicas manuales adicionales.

**Todos los casos funcionales están verificados; cierre formal pendiente únicamente de aceptación del usuario. La etapa 2 sigue sin iniciar.** El agente comprobó el rechazo de la contraseña anterior y acceso con la nueva, por API y navegador. Después cerró sesión/pestaña, detuvo ambos procesos de QA y retiró exclusivamente su DB temporal; el diagnóstico de limpieza confirmó cero bases de esa sesión. El video remoto ya se había retirado. Evidencia privada adicional: `customer-password-login-validated.jpg`.

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
| D-01 | Alcance ampliado por petición posterior | Reportes incluidos en el cierre, además de usuarios/roles | REP-01 implementado y validado; no adelanta transiciones de la etapa 3 |
| D-02 | Regla resuelta | Imagen opcional; proveedor y categoría obligatorios | Aprobado e implementado en altas; categorías/producto se persisten juntos; datos históricos preservados |
| D-03 | Validación externa completada | PNG de producto y MP4 ficticio autorizados y comprobados | Video cargado, reproducido, editado y alternado; ambos recursos QA retirados con ausencia remota verificada |
| D-04 | Regla resuelta | Precio mayor que cero | Aprobado; API rechaza precio cero en altas y cuando se envía un precio nuevo; UI comprobada |
| D-05 | Resuelto | Ayuda, Ofertas y Notificaciones eran controles sin acción | Retirados del encabezado para no publicar acciones vacías; sin crear funcionalidades futuras |
| D-06 | Resuelto | Formatos de precio distintos y centavos redondeados a cero | Formato COP compartido, máximo dos decimales; 0.10 se muestra como $0,1 en administración y tienda, comprobado desde UI |
| D-07 | Validación técnica completada | Registro, direcciones, proveedores, empleados, perfil y pendientes técnicos de catálogo/medios/tema/reportes | Cambio de contraseña desde UI completado y acceso verificado; resta aceptación final del usuario |

Las reglas de estados de pedido, fecha efectiva de pago, cancelación y devolución pertenecen a la etapa 3. Esta revisión registra lo observado, sin introducir dichas reglas anticipadamente.

## Primera revisión de interfaz — commit af03871

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

1. **Cumplido para usuarios/reportes y catálogo:** decisión registrada en [usuarios-y-productos.md](usuarios-y-productos.md).
2. Completar los casos pendientes que pertenecen a ese alcance.
3. Probar los medios externos con una cuenta y datos de prueba autorizados, si están incluidos.
4. Verificar correcciones sin regresiones en los tamaños y roles acordados.
5. Registrar aceptación del usuario con fecha y observaciones.

Aceptación del usuario: **pendiente**. Inicio de etapa 2: **no autorizado todavía por la condición de secuencia**.

## Continuación con las decisiones aprobadas

- Usuarios/roles implementados en `frontend/src/modules/users`, con adaptador HTTP y casos de uso. Pantalla visible solo a ADMIN; acceso directo del empleado rechazado y menú móvil sin esa opción, comprobados en navegador.
- Respuestas de usuarios y esquemas Swagger excluyen contraseña. Cambiar contraseña cifra el nuevo valor; se comprobó inicio de sesión con la nueva y rechazo de la anterior mediante API.
- Cuenta, roles y nuevo perfil cliente se guardan juntos. Acceso vigente consultado por solicitud, último ADMIN protegido con bloqueo compartido y estados empleado/cuenta atómicos.
- Alta y edición de producto sin imagen comprobadas; el alta requiere proveedor/categorías/precio positivo. Un fallo de categorías revierte también la edición de stock y la auditoría.
- Capturas locales: `users-roles-implemented.jpg`, `users-roles-mobile.jpg` y `product-optional-image.jpg`, bajo `.local/functional-evidence`. La vista móvil estable tiene documento de 390 px y contenido de aproximadamente 390 px.
- La imagen externa opcional y el CRUD de medios reales no se probaron contra Cloudinary. Los demás casos marcados pendientes mantienen ese estado: esta continuación no cierra la etapa 1.

Validación de esta continuación: `pnpm typecheck`, `pnpm lint` y `pnpm build` en ambos paquetes; 10 unitarias y 28 de integración PostgreSQL correctas. `pnpm test:upgrade` conservó 21 tablas de negocio y verificó idempotencia. `pnpm db:check` no encontró migraciones pendientes, inconsistencias de stock ni números de pedido duplicados. La sesión ficticia se cerró y su base temporal se retiró; no se publicaron registros de demostración en la base habitual.

## Rondas adicionales de interfaz y medios

Se comprobaron registro y duplicados; direcciones CRUD/predeterminada; eliminar/vaciar carrito; búsqueda/categoría/estado vacío; filtros de pedidos; proveedores CRUD/estados/trazabilidad; empleados CRUD/estado; perfil y restricciones de configuración; ajuste desde productos y filtros de auditoría; y dashboard a 390 px sin desbordamiento horizontal.

Se corrigieron consultas de pedidos que ignoraban parámetros, pérdida de controles con resultados vacíos, bloqueo reactivo de guardar configuración, refresco de listas de proveedores, eliminación lógica que alternaba estado, booleano `false` interpretado como verdadero, trazabilidad eternamente en carga, cuentas huérfanas ante altas fallidas y formatos monetarios que ocultaban centavos.

La carga externa se limitó al PNG azul de 32×32 aprobado por el usuario, cuenta Cloudinary configurada y autorizada, carpeta `zeroInventoryProducts`, vinculado a producto de DB temporal. El navegador confirmó imagen cargada de 32×32. La revisión automática rechazó su borrado porque la autorización inicial cubría solo la carga; se pidió autorización separada. No se intentó eludir ese rechazo.

Las imágenes de producto admiten PNG/JPEG/WebP de hasta 5 MB con comprobación de firma y MIME. Reemplazar no retira el recurso anterior antes de guardar el nuevo. Si falla la DB, se compensa solo el recurso recién creado. En videos se aplicó el mismo orden de persistencia y se corrigió el uso del tipo `video` al retirar recursos; **esto no equivale a una prueba real de reproducción/carga de video**.

Resultados técnicos finales: 19 pruebas unitarias y 34 de integración, además de tipos, lint y build en ambos paquetes. Sin migraciones nuevas. Las capturas adicionales permanecen en `.local/functional-evidence`: `customer-settings-validated.jpg`, `employees-validated.jpg`, `inventory-audit-validated.jpg`, `order-filters-fixed.jpg`, `dashboard-mobile-validated.jpg`, `suppliers-filter-validated.jpg`, `cloudinary-qa-upload-validated.jpg`.

La etapa 1 continúa abierta con las limitaciones de la matriz y sin aceptación final; etapas 2–6 sin iniciar y pasarela sin integrar.

## Limpieza final

Tras la autorización expresa de retirada, se eliminó únicamente el PNG QA recién creado. Se verificaron cero referencias de imagen en la DB temporal y respuesta de recurso inexistente de Cloudinary. Los medios anteriores se conservaron. Se cerraron sesiones, pestañas y procesos de revisión y se comprobó que la última base temporal ya no existe.

El diagnóstico final de la DB habitual volvió a mostrar cero migraciones pendientes, cero diferencias de stock y cero números de pedido duplicados. La etapa 1 permanece abierta por las limitaciones y aceptación indicadas; esta limpieza no autoriza iniciar la etapa 2.

## Estado final para aceptación — 12 de noviembre de 2026

El usuario confirmó la prueba personal de contraseña. AUT-06 y CFG-01 ya no tienen recorridos pendientes. Los casos de la matriz están verificados con el alcance y los límites de evidencia descritos en cada fila; esto no equivale a una auditoría completa de accesibilidad ni a la implantación de las etapas 2–6.

Validación del último recorrido: contraseña anterior rechazada (HTTP 401) y nueva aceptada (HTTP 201); ambos resultados repetidos en navegador, con entrada a Tienda. Sesión de QA cerrada y base temporal inexistente. No se cambiaron datos habituales ni quedaron medios externos de QA.

Implementación guardada en `008c921`; esta actualización documental registra el último recorrido. `dev` todavía no incorpora esta revisión. Se solicita al responsable aceptar los resultados o señalar ajustes; la publicación/integración y la etapa 2 respetan ese cierre.
