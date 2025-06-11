import { MigrationInterface, QueryRunner } from "typeorm";

export class ContactTable1749570914219 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "linkPrecedenceType" AS ENUM('primary', 'secondary');`
        );
        await queryRunner.query(
            `
            CREATE TABLE IF NOT EXISTS "contact" (
                "id" SERIAL PRIMARY KEY,
                "phoneNumber" TEXT,
                "email" TEXT,
                "linkPrecedence" "linkPrecedenceType" DEFAULT 'primary' NOT NULL,
                "linkedId" INTEGER DEFAULT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "deletedAt" TIMESTAMP
            );
            `
        )
        await queryRunner.query(
            `
            CREATE OR REPLACE FUNCTION update_updatedAt_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW."updatedAt" := NOW();
                    RETURN NEW;
                END;
            $$ LANGUAGE plpgsql;
            `
        );
        await queryRunner.query(
            `
            CREATE TRIGGER update_contact_updatedAt 
                BEFORE UPDATE ON contact 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updatedAt_column();
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_contact_updatedAt ON "contact";`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updatedAt_column;`);
        await queryRunner.query(`DROP TABLE IF EXISTS "contact";`);
        await queryRunner.query(`DROP TYPE IF EXISTS "linkPrecedenceType";`);
    }

}
