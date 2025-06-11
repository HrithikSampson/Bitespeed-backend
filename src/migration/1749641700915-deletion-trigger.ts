import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletionTrigger1749641700915 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION on_delete_contact()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW."deletedAt" := NOW();
                    RETURN NEW;
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
    }

}
