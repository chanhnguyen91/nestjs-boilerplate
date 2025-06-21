import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUsersAndRefreshTokens1660888888887 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'password', type: 'varchar', length: '255', isNullable: false },
          { name: 'name', type: 'varchar', length: '255', isNullable: true },
          { name: 'is_verified', type: 'boolean', default: '0' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { columnNames: ['email'], name: 'idx_users_email' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'token', type: 'varchar', length: '500', isNullable: false },
          { name: 'expires_at', type: 'datetime', isNullable: false },
          { name: 'user_id', type: 'int', isNullable: false },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { columnNames: ['user_id'], name: 'idx_refresh_tokens_user_id' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          { name: 'user_id', type: 'int', isNullable: false },
          { name: 'role_id', type: 'int', isNullable: false },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { columnNames: ['user_id'], name: 'idx_user_roles_user_id' },
          { columnNames: ['role_id'], name: 'idx_user_roles_role_id' },
        ],
      }),
    );

    await queryRunner.createForeignKey('refresh_tokens', new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('user_roles', new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('user_roles', new TableForeignKey({
      columnNames: ['role_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'roles',
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('refresh_tokens', 'FK_refresh_tokens_user_id');
    await queryRunner.dropForeignKey('user_roles', 'FK_user_roles_user_id');
    await queryRunner.dropForeignKey('user_roles', 'FK_user_roles_role_id');
    await queryRunner.dropIndex('refresh_tokens', 'idx_refresh_tokens_user_id');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_user_id');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_role_id');
    await queryRunner.dropIndex('users', 'idx_users_email');
    await queryRunner.dropTable('refresh_tokens');
    await queryRunner.dropTable('user_roles');
    await queryRunner.dropTable('users');
  }
}