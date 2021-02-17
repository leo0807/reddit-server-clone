import {MigrationInterface, QueryRunner} from "typeorm";

export class createVotesTable1613531169229 implements MigrationInterface {
    name = 'createVotesTable1613531169229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "votes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" integer NOT NULL, "username" character varying NOT NULL, "usernmae" character varying, "postId" integer, "commentId" integer, CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_8671db297bc6d52c78654e692b0" FOREIGN KEY ("usernmae") REFERENCES "users"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_b5b05adc89dda0614276a13a599" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_554879cbc33538bf15d6991f400" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_554879cbc33538bf15d6991f400"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_b5b05adc89dda0614276a13a599"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_8671db297bc6d52c78654e692b0"`);
        await queryRunner.query(`DROP TABLE "votes"`);
    }

}
