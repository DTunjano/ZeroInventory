import { ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

/** Compartido por cuentas y asignaciones; serializa los cambios de acceso. */
export async function lockAccess(manager: EntityManager): Promise<number> {
  await manager.query('SELECT pg_advisory_xact_lock(4971, 0)');
  return countAdmins(manager);
}

async function countAdmins(manager: EntityManager): Promise<number> {
  const [row] = await manager.query<{ count: number }[]>(`SELECT COUNT(DISTINCT u.usuario_id)::int AS count
    FROM usuario u JOIN usuario_rol ur ON ur.usuario_id=u.usuario_id
    JOIN rol r ON r.rol_id=ur.rol_id WHERE u.is_active=true AND r.nombre='ADMIN'`);
  return row.count;
}

export async function preserveAdmin(manager: EntityManager, previousCount: number) {
  if (previousCount > 0 && await countAdmins(manager) === 0) {
    throw new ConflictException('Debe conservarse al menos un administrador activo');
  }
}
