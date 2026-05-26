import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'zeroinventory',
  entities: [],
});

async function fixNullTipoMovimiento() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a la base de datos...');

    const result = await AppDataSource.query(
      "UPDATE ajuste_inventario SET tipo_movimiento = 'AJUSTE' WHERE tipo_movimiento IS NULL"
    );

    console.log('Registros actualizados:', result);
    console.log('✅ Limpieza completada correctamente');
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixNullTipoMovimiento();
