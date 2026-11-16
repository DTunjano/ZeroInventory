import { loadEnvironment } from '../config/environment';
import { parseWompiConfig } from '../config/wompi.config';

loadEnvironment();
try {
  const configured = parseWompiConfig(process.env);
  console.log(
    configured
      ? 'Wompi Sandbox configurado localmente. No se mostraron llaves ni se consultó al proveedor; falta validar la cuenta mediante una compra de prueba.'
      : 'Wompi deshabilitado. Completa backend/wompi.env.example en backend/.env y activa sandbox para probar.',
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Configuración Wompi inválida',
  );
  process.exitCode = 1;
}
