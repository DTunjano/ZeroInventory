import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dataSource from '../config/data-source';

async function main() {
  await dataSource.initialize();
  try {
    const lines = ['# Modelo de datos de ZeroInventory', '',
      'Diccionario generado desde las entidades ORM canónicas. Incluye el estado esperado después de aplicar las migraciones; no contiene registros ni credenciales.', '',
      'Hay 21 tablas de negocio y la tabla técnica `migrations`. Todas usan claves primarias numéricas generadas. Las relaciones que se muestran abajo son claves foráneas declaradas en TypeORM. `empleado.usuario_id` es una referencia lógica opcional que actualmente no tiene una FK declarada.', '',
      '## Reglas adicionales de las migraciones', '',
      '- Pedido: índice único `uq_pedido_cliente_numero` sobre `(cliente_id, numero_pedido_usuario)`. Los números anteriores conciliados quedan en `numero_pedido_usuario_legacy`.',
      '- Producto: `cantidad >= 0`; líneas de carrito y pedido y movimientos de Kardex: `cantidad > 0`.',
      '- Importes de producto, compra, pedido, detalles, pago y Kardex: `numeric(14,2)`.',
      '- El saldo materializado de producto debe coincidir con entradas menos salidas del Kardex. Los ajustes se documentan por separado y sus efectos se reflejan en movimientos firmados por dirección.',
      '- No hay eliminaciones en cascada del historial de ventas o inventario. Los maestros con estado se desactivan; las restricciones de otras relaciones se responden como HTTP 409.', '',
      '## Relaciones principales', '', '```mermaid', 'erDiagram',
      '  usuario ||--o{ usuario_rol : tiene', '  rol ||--o{ usuario_rol : asigna',
      '  usuario ||--o| cliente : perfil', '  usuario ||--o{ carrito : utiliza',
      '  cliente ||--o{ direccion : registra', '  proveedor ||--o{ direccion : registra',
      '  proveedor ||--o{ producto : suministra', '  producto ||--o{ producto_imagen : ilustra',
      '  producto ||--o{ categoria_producto : clasifica', '  categoria ||--o{ categoria_producto : agrupa',
      '  carrito ||--o{ carrito_detalle : contiene', '  producto ||--o{ carrito_detalle : aparece',
      '  cliente ||--o{ pedido : realiza', '  direccion ||--o{ pedido : recibe',
      '  pedido ||--o{ pedido_detalle : contiene', '  producto ||--o{ pedido_detalle : vendido',
      '  pedido ||--o{ pago : registra', '  proveedor ||--o{ compra : recibe',
      '  usuario ||--o{ compra : registra', '  compra ||--o{ compra_detalle : contiene',
      '  producto ||--o{ compra_detalle : comprado', '  producto ||--o{ kardex : movimientos',
      '  producto ||--o{ ajuste_inventario : ajusta', '  usuario ||--o{ ajuste_inventario : audita', '```', '',
      'El contenido multimedia (`media`) es independiente. La relación empleado–usuario es lógica y no se representa como FK en el diagrama.', ''];
    for (const table of [...dataSource.entityMetadatas].sort((a, b) => a.tableName.localeCompare(b.tableName))) {
      lines.push(`## ${table.tableName}`, '', '| Columna | Tipo | NULL | Observación |', '| --- | --- | --- | --- |');
      for (const column of table.columns) {
        const type = typeof column.type === 'string' ? column.type : column.type.name;
        const specification = column.enum ? `enum: ${column.enum.join(', ')}` : column.precision ? `${type}(${column.precision},${column.scale ?? 0})` : column.length ? `${type}(${column.length})` : type;
        const notes = [column.isPrimary ? 'PK generada' : '', ...table.foreignKeys.filter((fk) => fk.columnNames.includes(column.databaseName)).map((fk) => `FK → ${fk.referencedTablePath}(${fk.referencedColumnNames.join(', ')})`),
          ...table.uniques.filter((u) => u.columns.some((c) => c.databaseName === column.databaseName)).map(() => 'UNIQUE')].filter(Boolean).join('; ');
        lines.push(`| \`${column.databaseName}\` | ${specification} | ${column.isNullable ? 'Sí' : 'No'} | ${notes} |`);
      }
      lines.push('');
    }
    lines.push('## Mantenimiento', '', 'Regenerar desde `backend` con `pnpm db:docs` después de cambiar entidades y migraciones. `synchronize` permanece desactivado; este comando solo lee metadatos y escribe este documento.', '');
    const directory = resolve(__dirname, '../../docs');
    mkdirSync(directory, { recursive: true });
    writeFileSync(resolve(directory, 'database-schema.md'), lines.join('\n'));
    console.log('Modelo escrito en docs/database-schema.md');
  } finally { await dataSource.destroy(); }
}
void main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
