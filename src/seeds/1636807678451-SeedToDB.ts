import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedToDB1636807678451 implements MigrationInterface {
  name = 'SeedToDB1636807678451';

  //password: admin
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO users (username, email, password) Values ('admin', 'admin@gmail.com', '$2a$10$3NBXbwsAwId/uWumTFd2f.aQFtYTrKrizRtxpRJQF68dM2uvXICNu')`,
    );

    await queryRunner.query(
      `INSERT INTO tags (name) Values ('nestjs'), ('expressjs'), ('koajs')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(``);
  }
}
