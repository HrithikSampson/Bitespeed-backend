import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletionTrigger1749641700915 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION on_delete_contact()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE "contact"
                SET "deletedAt" = NOW()
                WHERE "id" = OLD."id";
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
            CREATE TRIGGER delete_contact_trigger
            BEFORE DELETE ON "contact"
            FOR EACH ROW
            WHEN (OLD."deletedAt" IS NULL)
            EXECUTE FUNCTION on_delete_contact();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS delete_contact_trigger ON "contact";
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS on_delete_contact;
        `);
    }

}
