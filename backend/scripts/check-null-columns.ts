import { DataSource } from 'typeorm';

// Crear conexión directa sin usar el config
const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'dtunjano',
  password: '1234',
  database: 'zero_inventory',
  entities: [],
  synchronize: false,
  logging: false,
});

async function checkNullColumns() {
  try {
    await dataSource.initialize();
    
    const columns = ['tipo_movimiento', 'cantidad', 'stock_anterior', 'stock_nuevo', 'tipo_cambio', 'motivo'];
    
    console.log('📋 Columnas con valores NULL en ajuste_inventario:');
    for (const col of columns) {
      try {
        const result = await dataSource.query(
          `SELECT COUNT(*) as count FROM ajuste_inventario WHERE "${col}" IS NULL`
        );
        const count = result[0]?.count || 0;
        if (parseInt(count) > 0) {
          console.log(`   ❌ ${col}: ${count} registros NULL`);
        }
      } catch (colError) {
        console.log(`   ⚠️  ${col}: No existe o error al consultar`);
      }
    }
    
  } catch (error: any) {
    console.error('Error de conexión:', error.message);
  } finally {
    try {
      await dataSource.destroy();
    } catch {}
  }
}

checkNullColumns();
