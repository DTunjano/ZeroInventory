# Plan de trabajo y condiciones de cierre

Actualizado: 14 de noviembre de 2026.

## Regla de avance

Las seis etapas se trabajan en orden. **Las etapas 1 y 2 están cerradas y aceptadas; está activa la etapa 3.** La etapa siguiente comienza cuando la anterior tiene evidencia suficiente, pendientes explícitos y aceptación del responsable del proyecto. Un build correcto no equivale a la aceptación funcional del MVP.

La pasarela de pagos está **aplazada por instrucción del usuario**. La consulta de opciones de simulación no autoriza añadir SDKs, endpoints, webhooks, credenciales, métodos de pago, migraciones ni conexiones a un proveedor.

| Etapa | Estado | Trabajo técnico | Condición para cerrar |
| --- | --- | --- | --- |
| 1. Revisión funcional y usabilidad | **Cerrada y aceptada — 12/11/2026** | Inventario de pantallas y permisos, recorridos con datos ficticios, revisión móvil/escritorio, matriz de aceptación y corrección de fallos del alcance actual | Matriz revisada; casos del alcance ejecutados; bloqueos corregidos o excluidos expresamente; aprobación del alcance y resultados por el usuario |
| 2. Ciclo del inventario | **Cerrada y aceptada — 14/11/2026** | Compras, recepción, entradas, ajustes y bajas coherentes con Kardex y auditoría | Operaciones y reglas aprobadas; pruebas de integridad, concurrencia y reversión correctas |
| 3. Pedidos y pagos internos | **Entrega técnica validada; aceptación pendiente** | Política aprobada, gestión administrativa, entrega separada del pago, cancelaciones/devoluciones, reembolsos e historial | Matriz ejecutada en [pedidos-y-pagos.md](pedidos-y-pagos.md), 67 integraciones correctas; falta aceptación del responsable. La pasarela requiere autorización posterior separada |
| 4. Pruebas automáticas de interfaz | Pendiente, sin iniciar | Convertir los recorridos acordados en regresión ejecutable e integrarlos a CI | Casos críticos estables y resultado verificable en CI |
| 5. Entorno publicado de pruebas | Pendiente, sin iniciar | Preparar despliegue, HTTPS, secretos, CORS, monitoreo y restauración | Acceso externo aprobado, servicios elegidos por el usuario y recuperación probada |
| 6. Primera entrega | Pendiente, sin iniciar | Alcance final, versión, datos de demostración y documentación de uso | Aceptación del usuario y demostración reproducible de los criterios acordados |

## Reparto de responsabilidades

| Actividad | Agente | Usuario / responsable del proyecto |
| --- | --- | --- |
| Revisar e implementar código y migraciones | Ejecuta, documenta y valida | Confirma las reglas que no están definidas |
| Probar recorridos con datos ficticios | Prepara el entorno aislado y registra evidencia | Puede revisar las demostraciones y señalar necesidades de uso |
| Decidir qué entra en el MVP | Propone alternativas y muestra lo existente | **Aprueba el alcance** |
| Proveedor, categoría, imagen, precio cero y otros requisitos de catálogo | Detecta diferencias entre interfaz y API | **Define la regla de negocio** |
| Decidir quién confirma/cancela/devuelve y cuándo cambia el stock | Explica y aplica la decisión aprobada | **Aprueba la política** antes de la etapa 3 |
| Cuentas de Cloudinary, hosting o futuro proveedor de pagos | Prepara la configuración y explica los permisos mínimos | Crea o autoriza las cuentas, realiza verificaciones personales y acepta las condiciones del servicio |
| Contraseñas, 2FA y verificaciones de identidad | Evita exponer secretos y usa el flujo autorizado | Conserva el control de las cuentas; completa las verificaciones que correspondan |
| Aceptación visual y de negocio | Presenta un resultado concreto y una matriz comprobable | **Aprueba o solicita ajustes** para cerrar cada etapa |

No hace falta que el usuario programe, edite SQL, resuelva Git ni repita las pruebas técnicas por su cuenta. Las decisiones de alcance y aceptación no se inventarán en su nombre.

## Cierre de la etapa 1

Documento de referencia: [revisión funcional del MVP](revision-funcional-mvp.md).

- [x] Revisar rutas y módulos realmente publicados.
- [x] Preparar una sesión con perfiles y registros ficticios en una base independiente.
- [x] Recorrer catálogo, autenticación, carrito y compra ficticia desde la interfaz.
- [x] Revisar navegación y accesos de cliente, empleado y administrador.
- [x] Identificar pantallas provisionales y requisitos contradictorios.
- [x] Detectar y corregir el bloqueo de navegación móvil.
- [x] Completar reportes, tema claro, orden visual y video real de la matriz.
- [x] Completar cambio de contraseña desde UI por el usuario; contraseña anterior rechazada y nueva aceptada, por API y navegador.
- [x] Acordar los requisitos de catálogo y el tratamiento de usuarios/reportes: usuarios/roles incluidos y REP-01 incorporado por petición posterior, imagen opcional, proveedor/categoría/precio positivo obligatorios en altas.
- [x] Validar PNG y MP4 ficticios autorizados en Cloudinary, verificar render/reproducción y retirar únicamente sus recursos QA.
- [x] Obtener aceptación del usuario sobre el resultado de la etapa 1: «Acepto el cierre y continuar con etapa 2», 12/11/2026.

**Etapa 1 cerrada y aceptada. El usuario autorizó continuar con la etapa 2 el 12/11/2026.**

La sesión ficticia se cerró, los procesos de QA se detuvieron y la DB temporal fue retirada. Todos los casos de la matriz están verificados y el responsable aceptó el resultado.

## Inicio de la etapa 2

Diagnóstico, decisiones de recepción y garantías de integridad en [ciclo-inventario.md](ciclo-inventario.md). El cierre aceptado de la etapa 1 está publicado en `dev` y su CI pasó. El 13/11/2026 el usuario eligió borrador sin cambio de stock y recepción completa posterior. Se implementaron compras, historial, Kardex de lectura y ajustes con motivo en `codex/inventory-lifecycle`. La validación y aceptación final de esta entrega se registran en su matriz; no se iniciará la etapa 3 antes de la aceptación del usuario.

## Cierre de la etapa 2 e inicio de la etapa 3

El 14/11/2026 el usuario aceptó «Acepto el cierre y continuar con etapa 3». La entrega `99406e0` está publicada en `dev` y su CI pasó. Se completaron 33 unitarias backend, 54 de integración, 7 frontend, recorridos manuales, actualización de copia, respaldo y diagnóstico final; QA retirado. La etapa 2 queda cerrada y la etapa 3 comienza en `codex/order-payment-lifecycle`, primero con el diagnóstico de las vías activas y la definición explícita de las reglas de pedidos, cancelaciones, devoluciones y pagos internos. No se autoriza una pasarela con esta aceptación.

## Entrega técnica de etapa 3

La etapa 3 ya aplica las tres decisiones del responsable: pago aprobado antes del envío, cancelación de CONFIRMADO por cliente propietario/ADMIN y devolución completa por ADMIN. Se verificaron API/PostgreSQL, rollback/concurrencia, UI por los tres roles, móvil/escritorio, claro/oscuro, Kardex y CSV. La matriz, limitación de históricos y pasos de revisión personal están en [pedidos-y-pagos.md](pedidos-y-pagos.md). La base ficticia y los procesos de QA fueron retirados. Falta la aceptación del responsable para cerrar formalmente la etapa 3; la etapa 4 sigue sin iniciar.

## Simulación de pagos: decisión futura

Hay dos alternativas distintas que pueden evaluarse cuando corresponda:

1. **Simulador local:** resultados ficticios de aprobado, rechazado o pendiente, sin cuenta de un proveedor ni solicitudes externas. No genera comisiones de pasarela ni cargos sobre tarjetas; su costo adicional de proveedor es cero.
2. **Sandbox de un proveedor:** reproduce una integración externa con credenciales y datos de prueba. Por ejemplo, [Wompi documenta un ambiente Sandbox independiente de producción](https://docs.wompi.co/docs/colombia/ambientes-y-llaves/) para transacciones ficticias y resultados simulados. [Mercado Pago también documenta compras con tarjetas de prueba](https://www.mercadopago.com.co/developers/es/docs/checkout-pro-preferences/integration-test/test-purchases).

El sandbox no mueve dinero real cuando se emplean su entorno y credenciales correctos. Antes de conectar una cuenta se revisarán sus condiciones y cualquier servicio contratado: no se debe presentar una pasarela de producción como gratuita ni introducir facturación real accidentalmente.

Si se autoriza posteriormente, la integración debe comprobar el modo de prueba, rechazar credenciales/URLs de producción en el entorno de demostración, mostrar claramente que es una simulación y utilizar datos de prueba. Estas son condiciones propuestas, **no funcionalidades ya implementadas**.
