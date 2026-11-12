import dataSource from '../config/data-source';

async function main() {
  await dataSource.initialize();
  const lock = dataSource.createQueryRunner();
  try {
    await lock.connect();
    await lock.query('SELECT pg_advisory_lock(4971, 0)');
    if (process.argv.includes('--status')) {
      console.log(await dataSource.showMigrations() ? 'Hay migraciones pendientes.' : 'Esquema actualizado.');
    } else {
      const migrations = await dataSource.runMigrations({ transaction: 'all' });
      console.log(migrations.length ? `Migraciones aplicadas: ${migrations.map((m) => m.name).join(', ')}` : 'Esquema actualizado. Sin cambios pendientes.');
    }
  } finally {
    await lock.query('SELECT pg_advisory_unlock(4971, 0)');
    await lock.release();
    await dataSource.destroy();
  }
}

void main().catch((error: Error) => {
  console.error(`No se pudo migrar: ${error.message}. No borres tablas ni volúmenes; consulta README.md.`);
  process.exitCode = 1;
});
