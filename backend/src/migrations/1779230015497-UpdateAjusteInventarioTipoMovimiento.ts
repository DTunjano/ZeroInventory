import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAjusteInventarioTipoMovimiento1779230015497 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Actualizar los valores NULL a 'AJUSTE'
        await queryRunner.query(
            `UPDATE "ajuste_inventario" SET "tipo_movimiento" = 'AJUSTE' WHERE "tipo_movimiento" IS NULL`
        );

        // Alterar la columna para añadir el valor por defecto
        await queryRunner.query(
            `ALTER TABLE "ajuste_inventario" ALTER COLUMN "tipo_movimiento" SET DEFAULT 'AJUSTE'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir el valor por defecto
        await queryRunner.query(
            `ALTER TABLE "ajuste_inventario" ALTER COLUMN "tipo_movimiento" DROP DEFAULT`
        );
    }

}
