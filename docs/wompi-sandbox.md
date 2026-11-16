# Wompi Sandbox — ampliación autorizada

Autorización del 15/11/2026: integrar Wompi para compras simuladas y preparar la separación necesaria para una futura integración real. Confirmación automática aprobada por el responsable, solo tras verificar transacción en backend; envío y entrega permanecen separados. El despliegue de etapa 5 sigue pausado y el acceso futuro será solo para invitados.

## Política de implementación

- Modo deshabilitado por defecto o Sandbox; producción se rechaza explícitamente. API Sandbox fija, llaves test, importe calculado en centavos por servidor, referencia única y firma de integridad generada en backend.
- Checkout externo alojado por Wompi: ZeroInventory no recibe números de tarjeta ni CVC. La redirección informa al comprador y no aprueba un pago por sí misma.
- Webhook verificado criptográficamente y consulta privada de la transacción al proveedor antes de aplicar resultados. Deben coincidir referencia, importe, moneda, intento y ambiente.
- La aprobación no toca stock ni entrega: el checkout ya hizo su salida atómica. Repetir o recibir concurrentemente una confirmación no duplica pago, eventos ni reembolso.
- Pagos internos EFECTIVO/TRANSFERENCIA conservan gestión manual. Un pago WOMPI no puede aprobarse/rechazarse manualmente como sustituto de verificar al proveedor.
- Cancelación/devolución mantiene el ciclo aprobado. Una aprobación tardía de un pedido cancelado se conserva como pago y genera reembolso pendiente, sin reabrir ni descontar stock. Reembolsos permanecen registrados manualmente; esta entrega no envía dinero.
- Los eventos de proveedor se identifican como automáticos, sin atribuirlos falsamente a un ADMIN. No se persisten cuerpos con datos personales ni se registran llaves/respuestas completas.

## Arquitectura y persistencia

`WompiModule` se registra en AppModule. Controlador → WompiUseCase → puertos WompiRepository/WompiGateway; los adaptadores TypeORM y HTTP implementan esos puertos. No se añadió SDK, dependencia ni servicio obligatorio. El checkout alojado recoge los datos del medio de pago fuera de ZeroInventory.

1. El checkout de carrito crea pedido CONFIRMADO, pago WOMPI/PENDIENTE, salida de stock y evento CREADO en la transacción existente. No supone pago recibido.
2. El cliente propietario solicita el enlace. Se bloquean pedido/pagos, se obtiene o crea una referencia `zi-test-<UUID>` y se firma el total persistido en centavos COP. Repetir la solicitud conserva la referencia pendiente.
3. El retorno entrega solo un ID; el servidor comprueba propiedad y consulta `https://sandbox.wompi.co/v1/transactions/{id}` con llave privada. Se comparan referencia, intento, moneda y total. El navegador nunca decide aprobación.
4. El webhook verifica SHA256 y las propiedades dinámicas de firma, exige ambiente test y vuelve a consultar la API privada. Un evento antiguo se concilia con el estado actual del proveedor. Referencias válidamente firmadas ajenas a esta instalación se ignoran.
5. La consulta HTTP termina antes de abrir la transacción. Después se bloquea primero pedido y luego intento/pago. Identidad/estado, pago, versión, reembolso eventual y evento se guardan con el mismo manager. Un error revierte todo. No hay escrituras de stock durante conciliación.

`WompiSandbox1794700800000` añade el método WOMPI y la tabla `wompi_intento`, cuya PK/FK es `pago_id`. Referencia y transacción son únicas. Solo permite ambiente sandbox y mantiene juntos ID/estado/fecha de verificación. `pedido_evento.origen` distingue USUARIO y WOMPI; la conciliación usa actor nulo, nunca un administrador inventado. La migración conserva pagos, pedidos, eventos y columnas históricas; no tiene reversión destructiva. Ver [modelo completo](database-schema.md).

| Estado verificado Wompi | Efecto local |
| --- | --- |
| PENDING | Conserva pago PENDIENTE, vincula ID para futuras consultas; sin nuevo evento ni versión |
| APPROVED | Pago APROBADO y evento WOMPI_VERIFICADO; el pedido conserva CONFIRMADO hasta envío manual |
| DECLINED / VOIDED / ERROR | Intento RECHAZADO; conserva historial y permite nuevo intento desde Mis pedidos |
| Duplicado del mismo resultado final | Sin nuevo pago, evento, stock ni versión |
| Cambio incompatible de un resultado final / otra transacción para la misma referencia | HTTP 409 y revisión; no sobrescribe automáticamente el resultado anterior |
| APPROVED después de CANCELADO | Conserva cancelación/stock restituido; pago aprobado y reembolso interno PENDIENTE |

Un reintento rechazado crea otro pago por el mismo total y referencia nueva; el anterior se conserva. Las solicitudes concurrentes de reintento producen un solo intento nuevo. Mientras está pendiente se reutiliza la referencia; no se crea otra para evadir un resultado aún no verificado. Si ya se conoce el ID pendiente, la UI ofrece verificarlo sin abrir otro checkout.

## Contrato HTTP

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| GET `/payments/wompi/availability` | Público | Solo disponibilidad y etiqueta sandbox; ninguna llave |
| POST `/payments/wompi/orders/:id/checkout` | CUSTOMER propietario | Enlace firmado y referencia; importe del servidor, sin datos de tarjeta |
| POST `/payments/wompi/orders/:id/reconcile` | CUSTOMER propietario | Cuerpo `{ "transactionId": "ID_DE_PRUEBA" }`; consulta privada y conciliación |
| POST `/payments/wompi/events` | Público con firma del proveedor | `transaction.updated`, ambiente test, checksum válido y consulta privada posterior |

Cuenta ajena responde 404 antes de consultar al proveedor. Un pago WOMPI no admite APROBAR_PAGO/RECHAZAR_PAGO/REINTENTAR_PAGO administrativos; el cliente reintenta mediante su endpoint. EFECTIVO/TRANSFERENCIA conservan acciones manuales. El webhook no es un endpoint público para asignar montos/usuarios/estados sin verificación. Errores del proveedor producen 503 sanitizado; no se guardan ni imprimen sus respuestas completas.

## Configurar la cuenta: pasos personales

1. Crea y verifica tu cuenta en [Wompi Comercios](https://comercios.wompi.co/). Completa personalmente sus condiciones, verificaciones y protección de cuenta. No hace falta autorizar producción para nuestro código.
2. En el ambiente **Sandbox**, consulta la sección de desarrolladores/integración técnica. Obtén llave pública `pub_test_`, privada `prv_test_`, secreto de integridad `test_integrity_` y secreto de eventos `test_events_`. Los nombres exactos de menú pueden variar; comprueba siempre el ambiente y los prefijos.
3. Abre `backend/.env` localmente. Si no existe, créalo. Copia únicamente las variables de `backend/wompi.env.example`, conserva el resto de la configuración y reemplaza los cuatro placeholders. No dupliques una variable con valores diferentes ni envíes las llaves por chat/capturas/Git. Cambia `WOMPI_MODE=disabled` a `WOMPI_MODE=sandbox` al completar las cuatro.
4. Usa `WOMPI_REDIRECT_URL=http://localhost:5173/me/orders` si Vite corre en 5173; ajusta al puerto real y conserva localhost tanto en frontend como API. Las variables de proceso tienen precedencia, luego backend/.env y luego el .env raíz.
5. Desde `backend` ejecuta `pnpm wompi:check`. Comprueba formato/entorno sin mostrar secretos ni consultar Wompi. Un resultado configurado no certifica que la cuenta/llaves sean aceptadas por el servicio.
6. Reinicia backend con `pnpm start:dev`. La otra consola sigue con `cd frontend` y `pnpm dev`; no hay un tercer servicio necesario.

Modo por defecto: disabled. Una credencial de producción, un modo distinto de sandbox/disabled o un retorno HTTP fuera de localhost hacen fallar la configuración. En NODE_ENV=production incluso el retorno local exige HTTPS; esto no habilita pagos de producción. Solo la llave pública y la firma de esa compra aparecen en el enlace alojado. Ningún secreto se configura con VITE_.

## Prueba real de Sandbox, aún pendiente de cuenta

Usar una **DB independiente con datos ficticios**, no pedidos personales ni productos reales del usuario. El agente preparará la sesión de QA y comprobará las salidas/limpieza antes de declarar validado el servicio. Las operaciones de prueba en Sandbox siguen creando datos persistentes dentro de ese ambiente del comercio.

1. Con CUSTOMER ficticio, añade un producto QA al carrito y elige «Wompi Sandbox · Simulación». Confirma la compra; el pedido queda confirmado y pendiente de pago. En Mis pedidos pulsa «Pagar con Wompi (prueba)».
2. En el checkout alojado usa exclusivamente los [datos de prueba oficiales](https://docs.wompi.co/docs/colombia/datos-de-prueba-en-sandbox/); nunca tarjeta/CVC ni cuentas bancarias reales. No copies datos de prueba obsoletos desde otro proveedor.
3. Completa un aprobado y vuelve a ZeroInventory. Debe aparecer resultado APROBADO verificado y mantenerse CONFIRMADO. Recarga/repite verificación: sin otra versión, pago o salida de stock. ADMIN debe poder enviar, después entregar, por separado.
4. Repite con resultado rechazado: conserva intento anterior; reintentar crea referencia nueva. Comprueba pendiente → aprobado y pérdida de red: no hay aprobación local por un retorno que diga `status=APPROVED`.
5. Verifica firma/recepción de evento real y duplicados cuando exista una URL HTTPS autorizada; prueba además cancelación previa al aviso de aprobación y reembolso interno pendiente. No registres reembolso realizado sin verificar la operación correspondiente; el registro nunca transfiere dinero.
6. Registra IDs/referencias QA en evidencia privada y solo resultados agregados en docs. Retira los procesos/DB temporal propios; no borres transacciones del comercio ni datos anteriores.

**Límite local:** Wompi no puede llamar localhost. El retorno sí permite consultar la API privada desde backend local. Para notificaciones asíncronas hace falta un endpoint HTTPS accesible al proveedor: `<API_HTTPS>/payments/wompi/events`. No se abrió túnel ni se desplegó un servicio. El acceso por invitación del futuro sitio deberá exceptuar este endpoint del bloqueo de red del sitio y protegerlo con firma; las demás rutas conservarán autenticación/roles. Se acordará al retomar la etapa 5.

Si el comprador cierra el checkout antes del retorno y no existe webhook público, puede quedar PENDIENTE sin ID local aunque Wompi haya procesado el pago. No asumas rechazo ni crees referencias alternativas a ciegas: revisa el Dashboard del comercio y resuelve la conciliación. La entrega actual no incluye un worker de reconciliación periódica ni una bandeja administrativa para estas excepciones.

## Matriz de validación

| Caso | Evidencia y estado |
| --- | --- |
| Ambiente/llaves de producción bloqueados, retorno seguro, firmas y parsing | Unitarias automatizadas correctas; sin solicitudes externas |
| Referencia concurrente única, importes/propiedad, bloqueo de aprobación manual | API + PostgreSQL temporal correctos |
| Firma falsa/ambiente prod rechazados; evento firmado vuelve a consultar proveedor | API con puerto Wompi sustituido, correcto |
| Callback/webhook concurrentes, duplicados, pendiente y resultado final | API + PostgreSQL temporal, correcto |
| Reintento conserva rechazado; aprobación tardía crea reembolso sin stock doble | API + PostgreSQL temporal, correcto |
| Rollback si falla auditoría | Fallo inducido de PostgreSQL, correcto |
| Carrito → checkout alojado → retorno → pago aprobado sin entregar; consulta de pendiente conservado | Navegador escritorio/móvil emulado, correcto con checkout y gateway de proveedor controlados; suite completa de 28 casos |
| Reporte distingue Wompi Sandbox de transferencia | Cuatro recorridos Wompi repetidos tras el ajuste de etiqueta, correctos en ambos tamaños |
| Cuenta/llaves y checkout reales de Wompi Sandbox | **Pendiente del responsable; no ejecutado** |
| Entrega de webhook real a URL HTTPS y recuperación sin retorno del comprador | **Pendiente de alojamiento autorizado y configuración del comercio** |
| Producción, transferencias/reembolsos bancarios reales | **Fuera de alcance y bloqueados** |

Los tests aislados fijan credenciales ficticias, sustituyen WompiGateway y bloquean tráfico externo del navegador; nunca heredan llaves reales. La compilación, los dobles y el CI no sustituyen la validación del servicio real.

## Preparación para producción futura

La separación en puertos, referencia por intento, importes inmutables, firma/verificación backend, persistencia e idempotencia permiten reutilizar el flujo. **No es un interruptor listo para cobrar con llaves live.** Antes de habilitarlo se necesita:

- Autorización expresa del responsable y aceptación de cuenta, condiciones, tarifas y métodos de Wompi; aclarar facturación/impuestos y obligaciones del comercio.
- Configuración revisada con aislamiento fuerte entre test/live, URL fija del proveedor, secretos de producción independientes y rotación/custodia adecuada. Nuevas migraciones si deben convivir ambientes; esta tabla permite únicamente sandbox.
- Hosting/HTTPS/CORS/cookies, webhook accesible/verificado, monitoreo con alertas sanitizadas y recuperación de notificaciones fallidas. Reconciliación periódica o administrativa con reglas auditadas, límites/reintentos del proveedor y manejo de excepciones/cargos múltiples.
- Política comercial aprobada para expiración de pedidos/reservas, pagos tardíos y devoluciones; la cancelación local no cancela una transacción bancaria en vuelo. Definir si el reembolso será manual verificado o por API, con permisos y conciliación; no confundir anotación interna con dinero devuelto.
- Validación real Sandbox aprobada, migración sobre copia/backup, pruebas de carga/concurrencia y piloto de producción de importe controlado autorizado. Revisar antifraude, protección de endpoints y requisitos aplicables del proveedor antes de cualquier dato financiero real.

Para deshabilitar nuevas compras Wompi, configura WOMPI_MODE=disabled y reinicia. Esto **no cancela** transacciones ya iniciadas y también deshabilita la conciliación/webhook: hazlo solo después de revisar pendientes o conserva un plan de conciliación. No borra pagos ni historial.

Referencias oficiales: [Checkout y firma](https://docs.wompi.co/docs/colombia/widget-checkout-web/), [eventos y checksum](https://docs.wompi.co/docs/colombia/eventos/), [consulta privada de transacciones](https://docs.wompi.co/docs/colombia/seguimiento-de-transacciones/), [separación de ambientes](https://docs.wompi.co/docs/colombia/ambientes-y-llaves/).
