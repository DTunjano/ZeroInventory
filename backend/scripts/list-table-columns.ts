import dataSource from '../config/data-source';



async function listTableColumns() {
  try {
    await dataSource.initialize();
    
    const columns = await dataSource.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ajuste_inventario'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estructura actual de la tabla ajuste_inventario:');
    console.log('────────────────────────────────────────────────────');
    for (const col of columns) {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    try {
      await dataSource.destroy();
    } catch { /* Connection was not initialized. */ }
  }
}

void listTableColumns();
