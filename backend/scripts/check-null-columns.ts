import dataSource from '../config/data-source';



async function checkNullColumns() {
  try {
    await dataSource.initialize();
    
    const columns = ['tipo_movimiento', 'cantidad', 'stock_anterior', 'stock_nuevo', 'tipo_cambio', 'motivo'];
    
    console.log('📋 Columnas con valores NULL en ajuste_inventario:');
    for (const col of columns) {
      try {
        const result = await dataSource.query<{ count: string }[]>(
          `SELECT COUNT(*) as count FROM ajuste_inventario WHERE "${col}" IS NULL`
        );
        const count = result[0]?.count || 0;
        if (Number(count) > 0) {
          console.log(`   ❌ ${col}: ${count} registros NULL`);
        }
      } catch {
        console.log(`   ⚠️  ${col}: No existe o error al consultar`);
      }
    }
    
  } catch (error: any) {
    console.error('Error de conexión:', error.message);
  } finally {
    try {
      await dataSource.destroy();
    } catch { /* Connection was not initialized. */ }
  }
}

void checkNullColumns();
