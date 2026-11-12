# Plan de trabajo y condiciones de cierre

Actualizado: 12 de noviembre de 2026.

## Regla de avance

Las seis etapas se trabajan en orden. **Solo está activa la etapa 1.** La etapa siguiente comienza cuando la anterior tiene evidencia suficiente, pendientes explícitos y aceptación del responsable del proyecto. Un build correcto no equivale a la aceptación funcional del MVP.

La pasarela de pagos está **aplazada por instrucción del usuario**. La consulta de opciones de simulación no autoriza añadir SDKs, endpoints, webhooks, credenciales, métodos de pago, migraciones ni conexiones a un proveedor.

| Etapa | Estado | Trabajo técnico | Condición para cerrar |
| --- | --- | --- | --- |
| 1. Revisión funcional y usabilidad | **En curso** | Inventario de pantallas y permisos, recorridos con datos ficticios, revisión móvil/escritorio, matriz de aceptación y corrección de fallos del alcance actual | Matriz revisada; casos del alcance ejecutados; bloqueos corregidos o excluidos expresamente; aprobación del alcance y resultados por el usuario |
| 2. Ciclo del inventario | Pendiente, sin iniciar | Compras, recepción, entradas, ajustes y bajas coherentes con Kardex y auditoría | Operaciones y reglas aprobadas; pruebas de integridad, concurrencia y reversión correctas |
| 3. Pedidos y pagos internos | Pendiente, sin iniciar | Reglas de transición, responsables, cancelaciones, devoluciones y efectos sobre stock | Transiciones autorizadas, efectos una sola vez y pruebas correctas. La pasarela requiere una autorización posterior separada |
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
- [ ] Completar los casos pendientes de la matriz según el alcance acordado.
- [ ] Acordar los requisitos de catálogo y el tratamiento de usuarios/reportes en la primera entrega.
- [ ] Validar cargas reales de medios en una cuenta y con un archivo de prueba autorizados, si forman parte del alcance.
- [ ] Obtener aceptación del usuario sobre el resultado de la etapa 1.

**La etapa 1 no está cerrada. No se ha comenzado la etapa 2.**

## Simulación de pagos: decisión futura

Hay dos alternativas distintas que pueden evaluarse cuando corresponda:

1. **Simulador local:** resultados ficticios de aprobado, rechazado o pendiente, sin cuenta de un proveedor ni solicitudes externas. No genera comisiones de pasarela ni cargos sobre tarjetas; su costo adicional de proveedor es cero.
2. **Sandbox de un proveedor:** reproduce una integración externa con credenciales y datos de prueba. Por ejemplo, [Wompi documenta un ambiente Sandbox independiente de producción](https://docs.wompi.co/docs/colombia/ambientes-y-llaves/) para transacciones ficticias y resultados simulados. [Mercado Pago también documenta compras con tarjetas de prueba](https://www.mercadopago.com.co/developers/es/docs/checkout-pro-preferences/integration-test/test-purchases).

El sandbox no mueve dinero real cuando se emplean su entorno y credenciales correctos. Antes de conectar una cuenta se revisarán sus condiciones y cualquier servicio contratado: no se debe presentar una pasarela de producción como gratuita ni introducir facturación real accidentalmente.

Si se autoriza posteriormente, la integración debe comprobar el modo de prueba, rechazar credenciales/URLs de producción en el entorno de demostración, mostrar claramente que es una simulación y utilizar datos de prueba. Estas son condiciones propuestas, **no funcionalidades ya implementadas**.
