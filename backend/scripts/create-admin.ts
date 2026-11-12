import * as bcrypt from 'bcrypt';
import dataSource from '../config/data-source';
import { UsuarioEntityORM } from '../src/usuario/infrastructure/persistence/usuario.orm-entity';
import { UsuarioRolEntityORM } from '../src/usuario-rol/infrastructure/persistence/usuario-rol.orm-entity';
import { RolEntityORM } from '../src/rol/infrastructure/persistence/rol.orm-entity';
import { RolNombreEnum } from '../src/rol/domain/entity/rol.entity';

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || password.length < 12) throw new Error('Define ADMIN_USERNAME y ADMIN_PASSWORD (mínimo 12 caracteres).');
  await dataSource.initialize();
  try {
    const hash = await bcrypt.hash(password, 12);
    await dataSource.transaction(async (manager) => {
      if (await manager.exists(UsuarioEntityORM, { where: { username } })) throw new Error('El usuario ya existe; no se reemplazó su contraseña ni su rol.');
      const role = await manager.findOneBy(RolEntityORM, { nombre: RolNombreEnum.ADMIN });
      if (!role) throw new Error('Ejecuta pnpm db:migrate antes de crear el administrador.');
      const user = await manager.save(UsuarioEntityORM, manager.create(UsuarioEntityORM, { username, password: hash, isActive: true }));
      await manager.insert(UsuarioRolEntityORM, { usuarioId: user.usuarioId, rolId: role.rolId });
    });
    console.log('Administrador creado. No se imprimen credenciales.');
  } finally { await dataSource.destroy(); }
}
void main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
