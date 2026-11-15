# Etapa 3 — Pedidos y pagos internos

Inicio y reglas aprobadas: 14/11/2026. Rama de implementación: `codex/order-payment-lifecycle`. Etapas 1 y 2 cerradas y aceptadas. Estado: entrega técnica validada, pendiente de aceptación del responsable. La etapa 4 no ha comenzado.

## Política elegida por el responsable

- ADMIN/EMPLOYEE gestionan CONFIRMADO → ENVIADO → COMPLETADO; completar representa entrega realizada. Aprobar un pago no completa la entrega.
- Solo ADMIN aprueba/rechaza el pago por el total calculado por el servidor. Es necesario pago aprobado antes de enviar, tanto EFECTIVO como TRANSFERENCIA.
- CUSTOMER cancela su pedido propio CONFIRMADO; ADMIN también puede cancelar antes de envío. Motivo obligatorio y restitución de stock una sola vez.
- Solo ADMIN confirma una devolución completa de un pedido entregado, después de recibir físicamente todos sus productos. Motivo obligatorio y restitución una sola vez.
- Una cancelación/devolución con pago aprobado deja un reembolso interno pendiente. ADMIN registra después su realización con motivo/referencia. No se envía dinero, ni se integra pasarela, factura fiscal o proveedor financiero.

## Diagnóstico de partida

`PedidoModule`, `PedidoDetalleModule` y `PagoModule` estaban activos. Sus rutas CRUD permitían escrituras independientes de cabecera, líneas y pagos sin una máquina de transiciones. `ConfirmPagoUseCase` aprobaba un pago y completaba el pedido con repositorios separados; un fallo posterior podía dejar ambos estados distintos. El frontend solo publicaba Mis pedidos para CUSTOMER, etiquetaba COMPLETADO como Pagado y carecía de gestión administrativa de entrega/cancelación/devolución. Estas vías de escritura quedaron retiradas de la composición activa.

La inspección de solo lectura, con contenedor verificado por labels, encontró 30 pedidos CONFIRMADO y 30 pagos PENDIENTE: sin pedidos sin líneas/pago, sin pagos múltiples, sin diferencias entre total y suma de líneas ni entre pago y total. En 5 pedidos, las cantidades agrupadas por producto no coinciden con salidas VENTA de su referencia. No se infiere por ello que el saldo actual sea erróneo: ya está conciliado. Tampoco se certifica que esas unidades salieran por dicho pedido.

La migración conserva los 30 pedidos previos con versión de ciclo 0, de solo lectura, sin recrear eventos, cambiar estados ni restituir stock histórico automáticamente. El checkout nuevo inicia versión 1 y evento de creación en su misma transacción. Incorporar un histórico al nuevo ciclo necesita una reconciliación explícita por documento y no forma parte de esta entrega. Los 5 documentos sin coincidencia de salida quedan señalados por el diagnóstico, sin modificar sus datos.

## Arquitectura y garantías implementadas

`PedidoWorkflowController` traduce HTTP y sesión; `PedidoWorkflowUseCase` valida acción, motivo y permisos; el puerto de dominio `PedidoWorkflowRepository` lo implementa `TypeOrmPedidoWorkflowRepository`. El dominio no importa TypeORM. El checkout conserva su implementación transaccional existente y añade el evento de creación en esa misma transacción. Los CRUD históricos siguen en disco, pero sus casos de escritura no están registrados ni exportados por los módulos activos.

La cabecera se bloquea antes de pagos/productos; las mutaciones exigen versión y los productos se bloquean por ID ascendente. Cabecera, pagos, reembolso, evento, stock y Kardex comparten EntityManager. No se editan importes/líneas ni se borran documentos tras checkout. Cancelar/devolver valida las cantidades agrupadas contra las salidas VENTA originales y agrega entradas compensatorias `CANCELACION_PEDIDO` o `DEVOLUCION_PEDIDO`, sin borrar esas salidas. Se puede recibir un producto desactivado sin reactivarlo.

El reenvío de la misma solicitud (versión esperada, acción, actor, motivo normalizado e intento de pago) devuelve el estado actual si su evento ya existe, sin repetir stock, pago, reembolso ni historial. Otra solicitud con versión obsoleta recibe 409. La UI conserva el motivo durante el error y permite actualizar y revisar antes de abrir una operación con la versión vigente. Los botones quedan deshabilitados mientras se guarda y refresca la información.

El rechazo de un pago no cancela automáticamente el pedido ni cambia stock. Un reintento interno conserva el intento rechazado y crea otro pendiente por el mismo total; no admite cobros parciales ni dos pagos aprobados del mismo pedido. Los registros aprobados se conservan al reembolsar; el reembolso es un registro separado.

Cada evento tiene actor autenticado, fecha del servidor, versión única por pedido y snapshot de líneas, importes, intentos y reembolso. No existe endpoint para editar/borrar eventos. Una falla al guardar el evento revierte todas las escrituras anteriores de la operación.

## Operaciones, estados y permisos

| Acción | Estado/requisito | Resultado | Rol |
| --- | --- | --- | --- |
| Checkout | Carrito propio, dirección propia activa, disponibilidad bloqueada | CONFIRMADO, pago PENDIENTE, SALIDA VENTA, evento CREADO versión 1 | CUSTOMER |
| APROBAR_PAGO | CONFIRMADO; intento pendiente vigente; total completo del servidor | Pago APROBADO; pedido sigue CONFIRMADO | ADMIN |
| RECHAZAR_PAGO | Mismos requisitos de intento | Pago RECHAZADO; pedido y stock sin cambio | ADMIN |
| REINTENTAR_PAGO | CONFIRMADO; último intento rechazado; ninguno aprobado | Nuevo intento PENDIENTE por el mismo total/método; conserva el anterior | ADMIN |
| ENVIAR | CONFIRMADO y pago aprobado | ENVIADO | ADMIN / EMPLOYEE |
| ENTREGAR | ENVIADO y pago aprobado | COMPLETADO, mostrado como Entregado | ADMIN / EMPLOYEE |
| CANCELAR | CONFIRMADO, motivo | CANCELADO; stock restituido; pendientes ANULADO; si había aprobado, reembolso PENDIENTE | ADMIN / CUSTOMER propietario |
| DEVOLVER | COMPLETADO; recepción física completa y motivo | DEVUELTO; stock restituido; reembolso PENDIENTE | ADMIN |
| REGISTRAR_REEMBOLSO | CANCELADO/DEVUELTO; reembolso pendiente y pago aprobado válido | Reembolso REGISTRADO con actor, fecha y motivo/referencia | ADMIN |

No hay envíos sin pago aprobado, ni cancelación después del envío, ni devolución parcial, ni aprobación por empleado, ni modificación del importe enviado por el cliente. El reembolso es el registro manual de una operación verificada fuera de la aplicación, sin envío de dinero. La UI solicita confirmación de esa verificación y de recepción física al devolver.

## Contrato HTTP

| Ruta | Uso |
| --- | --- |
| `GET /pedidos` | ADMIN/EMPLOYEE; listado paginado con `page`, `limit`, `estado`, `clienteId`, `direccionId` validados |
| `GET /pedidos/:id` | ADMIN/EMPLOYEE; detalle, todos los intentos, reembolso e historial |
| `GET /pedidos/me` | CUSTOMER; filtros `estado`, `dateFrom`, `dateTo`, `sortBy`; siempre conserva propietario |
| `GET /pedidos/me/:id` | CUSTOMER propietario; un documento ajeno responde 404 |
| `POST /pedidos/:id/actions/:action` | ADMIN/EMPLOYEE; autorización fina según la tabla anterior |
| `POST /pedidos/me/:id/cancel` | CUSTOMER propietario; cancelación completa |

Las acciones reciben `{ "version": 1, "motivo": "Referencia verificable" }`; APROBAR_PAGO/RECHAZAR_PAGO también exigen `pagoId` del intento pendiente actual. `pagoId` no se admite en otras operaciones. `version` es entero positivo, `motivo` no vacío de hasta 1000 caracteres. No se aceptan actor, total o monto del cuerpo. Acciones correctas devuelven 200 con detalle actualizado. Entradas inválidas: 400; rol: 403; inexistente/ajeno: 404; transición, histórico o versión incompatible: 409.

Las escrituras genéricas de `/pedidos`, `/pagos`, `/pedido-detalles` y la confirmación anterior de pago responden 410. Se conservan sus lecturas administrativas; las nuevas escrituras pasan exclusivamente por checkout y acciones del ciclo. Los guards pueden rechazar antes con 401/403 a quien no está autorizado.

## Pantallas y fechas

- ADMIN/EMPLOYEE: menú **Pedidos y pagos**, `/admin/orders`; filtro de estado, diez documentos por página, detalle por `?order=<pedido_id>`, intentos, historial y acciones del rol. Los controles de filtro siguen disponibles con resultados vacíos.
- CUSTOMER: **Mis pedidos**, cancelación propia antes del envío, intentos, reembolso e historial. Entregado y Pagado son conceptos separados.
- Kardex enlaza VENTA/CANCELACION_PEDIDO/DEVOLUCION_PEDIDO al documento administrativo; muestra saldo y stock juntos.
- Las claves de React Query incluyen usuario; las mutaciones invalidan pedidos y las consultas relacionadas de inventario, catálogo, carrito, dashboard y reportes.
- Nuevos pedidos/pagos usan `registrada_en`/`registrado_en` y decisiones `decidido_en`; eventos y reembolsos usan timestamptz. Los filtros y agregados nuevos usan America/Bogota. Las fechas históricas sin zona permanecen como fallback, sin reconstrucción ficticia.
- Reportes mantiene aprobados brutos y agrega `refunds.pending`/`refunds.registered`, también en CSV. Un reembolso no borra ni reduce el pago aprobado original. Ver [reportes.md](reportes.md).

## Migración y protección de datos

`OrderLifecycle1794614400000` añade versión e instante de pedido, instantes de pago, `pedido_evento`, `pedido_reembolso`, pago ANULADO y las dos referencias compensatorias del Kardex. Son **24 tablas de negocio**, más `migrations`. El reembolso usa `pedido_id` como PK/FK compartida, garantizando uno por pedido; los eventos tienen unicidad pedido/versión y restricciones de acción/snapshot. El reembolso REGISTRADO exige actor, fecha y motivo; el pendiente no contiene datos de realización.

Antes de aplicarla se verificó contenedor/configuración, se probó actualización en copia conservando las 22 tablas anteriores e idempotencia y se creó un respaldo custom privado de 83.442 bytes, con catálogo `pg_restore --list` verificado. La migración ya está aplicada a la instalación local; no se debe reescribir. `down` rechaza borrar historial: una restauración se realiza en otra base. El diagnóstico local no tiene migraciones pendientes ni inconsistencias nuevas; conserva el aviso separado de los cinco históricos sin coincidencia de salida.

## Matriz de validación de etapa 3

| Caso | Resultado | Evidencia y límite |
| --- | --- | --- |
| PED-01 Checkout atómico y vías antiguas retiradas | Verificado | API/PostgreSQL: creación de evento, actor/importes desconocidos rechazados y escrituras antiguas 410; creación de pedidos ficticios para UI |
| PED-02 Pago antes de envío; entrega separada | Verificado | API + UI ADMIN: pedido 1 aprobado → enviado → entregado; EMPLOYEE: pedido 4 enviado/entregado sin botones financieros |
| PED-03 Rechazo y reintento sin perder intentos | Verificado | API + UI ADMIN: pedido 3 rechazado, segundo intento aprobado; intento original conservado |
| PED-04 Cancelación propia y autorización | Verificado | UI CUSTOMER: pedido 2 cancelado, pendiente anulado; API: ajeno 404 y permisos por rol |
| PED-05 Cancelación pagada y reembolso pendiente | Verificado | API + UI ADMIN: pedido 3 cancelado con reembolso pendiente de $12.000 |
| PED-06 Devolución completa y reembolso registrado | Verificado | API + UI ADMIN: pedido 1 devuelto y reembolso de $38.000 registrado, seis eventos conservados |
| PED-07 Concurrencia e idempotencia | Verificado | API/PostgreSQL: cancelaciones simultáneas, envío vs cancelación, repetición de cancelación/devolución/reembolso sin duplicar efectos |
| PED-08 Rollback de operación y auditoría | Verificado | API/PostgreSQL: falla de creación/evento de aprobación/cancelación, segunda línea de restitución y evento de reembolso; stock/documentos íntegros |
| PED-09 Versiones obsoletas | Verificado | API + UI CUSTOMER en 390 px: 409 conserva motivo, actualización y nuevo intento exitoso |
| PED-10 Kardex y conservación de salidas | Verificado | UI: Vaso QA stock 10 = saldo 10; salidas originales y entradas de cancelación/devolución; enlace abre pedido 1 devuelto versión 6 |
| PED-11 Históricos y migración | Verificado | Copia + API + UI: fixture histórico versión 0 solo lectura, sin acciones ni eventos inventados; no se operaron pedidos reales |
| PED-12 Listado, vacío y presentación | Verificado | UI: dos páginas de 12 pedidos, filtros y vacío, enlace directo; claro/oscuro, escritorio y 390 px; empleado sin acciones ADMIN |
| PED-13 Reportes y CSV | Verificado | API + UI/descarga: 12 pedidos por $69.009, aprobados brutos $50.001, pendientes $8, reembolsos pendientes $12.000 y registrados $38.000 |
| PED-14 Integridad final y limpieza | Verificado | CLI QA: inconsistencias nuevas cero; aviso histórico ficticio 1 esperado; DB temporal retirada, comprobado cero bases de esa sesión |
| PED-15 Aceptación del responsable | Pendiente | Revisar la entrega y aceptar cierre o indicar ajustes; requisito para comenzar etapa 4 |

Suites finales: **33 unitarias backend, 67 de integración PostgreSQL y 7 frontend**, además de tipos, ESLint y build de ambos paquetes. Las concurrencias y fallos inducidos tienen evidencia API/PostgreSQL, no se presentan como recorridos manuales. Las pantallas tienen revisión manual; automatizar esos recorridos corresponde a la etapa 4.

Las capturas se conservan privadamente en `.local/functional-evidence/phase3-*`; no se publican datos ficticios, sesiones ni dumps en Git. El pedido histórico ficticio adicional tiene fecha de 2020 y no altera el reporte de noviembre citado. Se detuvieron únicamente API/Vite de QA, se restauró viewport y se cerró su pestaña; no se detuvieron las consolas habituales del usuario ni otros contenedores. No se utilizaron servicios externos.

## Revisión personal para aceptar

1. Abrir **Pedidos y pagos** como ADMIN y revisar que las acciones y los textos corresponden a la política aprobada; un pedido nuevo se crea mediante checkout de una cuenta CUSTOMER.
2. Confirmar que **aprobar pago** significa registro interno de una verificación y que **entregar** es una acción posterior. No hay dinero ni facturación real en las pruebas realizadas.
3. Revisar la limitación de los 30 pedidos anteriores: permanecen consultables y de solo lectura; los cinco con trazabilidad incompleta no se reparan inventando movimientos.
4. Aceptar el cierre de etapa 3 o indicar el ajuste necesario. No hace falta ejecutar SQL, repetir pruebas técnicas ni resolver Git personalmente.
