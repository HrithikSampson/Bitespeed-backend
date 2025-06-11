import { MigrationInterface, QueryRunner } from "typeorm";

export class ConstraintTable1749620061087 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE "contact"
                ADD CONSTRAINT email_or_phone_not_null
                CHECK (
                    email IS NOT NULL OR "phoneNumber" IS NOT NULL
                );
            `
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
