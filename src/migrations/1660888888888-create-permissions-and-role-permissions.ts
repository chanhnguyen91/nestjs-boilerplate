import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePermissionsAndRolePermissions1660888888888 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { columnNames: ['name'], name: 'idx_permissions_name' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { columnNames: ['name'], name: 'idx_roles_name' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'role_id', type: 'int', isNullable: false },
          { name: 'permission_id', type: 'int', isNullable: false },
          { name: 'can_read', type: 'tinyint', default: 0 },
          { name: 'can_write', type: 'tinyint', default: 0 },
          { name: 'can_delete', type: 'tinyint', default: 0 },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        indices: [
          { columnNames: ['role_id'], name: 'idx_role_permissions_role_id' },
          { columnNames: ['permission_id'], name: 'idx_role_permissions_permission_id' },
        ],
      }),
    );

    await queryRunner.createForeignKey('role_permissions', new TableForeignKey({
      columnNames: ['role_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'roles',
      onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('role_permissions', new TableForeignKey({
      columnNames: ['permission_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'permissions',
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('role_permissions', 'FK_role_permissions_role_id');
    await queryRunner.dropForeignKey('role_permissions', 'FK_role_permissions_permission_id');
    await queryRunner.dropIndex('role_permissions', 'idx_role_permissions_role_id');
    await queryRunner.dropIndex('role_permissions', 'idx_role_permissions_permission_id');
    await queryRunner.dropIndex('roles', 'idx_roles_name');
    await queryRunner.dropIndex('permissions', 'idx_permissions_name');
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('roles');
    await queryRunner.dropTable('permissions');
  }
}