import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserEntity } from '../domains/user/entities/user.entity';
import { RoleEntity } from '../domains/role/entities/role.entity';
import { PermissionEntity } from '../domains/role/entities/permission.entity';
import { RolePermissionEntity } from '../domains/role/entities/role-permission.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PERMISSION_NAME } from '../common/constants/permission.constant';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  const roleRepository = app.get<Repository<RoleEntity>>(getRepositoryToken(RoleEntity));
  const permissionRepository = app.get<Repository<PermissionEntity>>(getRepositoryToken(PermissionEntity));
  const rolePermissionRepository = app.get<Repository<RolePermissionEntity>>(getRepositoryToken(RolePermissionEntity));

  // Seed roles
  const roles = ['admin', 'user', 'streamer'];
  for (const roleName of roles) {
    const existingRole = await roleRepository.findOne({ where: { name: roleName } });
    if (!existingRole) {
      const role = roleRepository.create({ name: roleName });
      await roleRepository.save(role);
      console.log(`Seeded role: ${roleName}`);
    }
  }

  // Seed permissions
  const permissions = [
    { name: PERMISSION_NAME.USER_MANAGEMENT, description: 'Permission to manage user data' },
    { name: PERMISSION_NAME.ROLE_MANAGEMENT, description: 'Permission to manage role data' },
    { name: PERMISSION_NAME.BILLING_MANAGEMENT, description: 'Permission to manage billing data' },
  ];
  for (const perm of permissions) {
    const existingPerm = await permissionRepository.findOne({ where: { name: perm.name } });
    if (!existingPerm) {
      const permission = permissionRepository.create(perm);
      await permissionRepository.save(permission);
      console.log(`Seeded permission: ${perm.name}`);
    }
  }

  // Link permissions to admin role
  const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
  const allPermissions = await permissionRepository.find();
  if (adminRole && allPermissions.length > 0) {
    const rolePermissions = allPermissions.map(permission =>
      rolePermissionRepository.create({
        role: adminRole,
        permission: permission,
        canRead: true,
        canWrite: true,
        canDelete: true,
      })
    );
    await rolePermissionRepository.save(rolePermissions);
    console.log(`Linked permissions to admin role`);
  }

  // Seed admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  let adminUser = await userRepository.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = userRepository.create({
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      name: 'Admin User',
      isVerified: true,
    });
    await userRepository.save(adminUser);
    adminUser.roles = [adminRole];
    await userRepository.save(adminUser);
    console.log(`Seeded admin user: ${adminEmail}`);
  }

  // Seed regular user
  const userEmail = 'user@example.com';
  let regularUser = await userRepository.findOne({ where: { email: userEmail } });
  if (!regularUser) {
    regularUser = userRepository.create({
      email: userEmail,
      password: await bcrypt.hash('user123', 10),
      name: 'Regular User',
      isVerified: true,
    });
    await userRepository.save(regularUser);
    const userRole = await roleRepository.findOne({ where: { name: 'user' } });
    regularUser.roles = [userRole];
    await userRepository.save(regularUser);
    console.log(`Seeded regular user: ${userEmail}`);
  }

  // Seed streamer user
  const streamerEmail = 'streamer@example.com';
  let streamerUser = await userRepository.findOne({ where: { email: streamerEmail } });
  if (!streamerUser) {
    streamerUser = userRepository.create({
      email: streamerEmail,
      password: await bcrypt.hash('streamer123', 10),
      name: 'Streamer User',
      isVerified: true,
    });
    await userRepository.save(streamerUser);
    const streamerRole = await roleRepository.findOne({ where: { name: 'streamer' } });
    streamerUser.roles = [streamerRole];
    await userRepository.save(streamerUser);
    console.log(`Seeded streamer user: ${streamerEmail}`);
  }

  await app.close();
  console.log('Seeding completed successfully.');
}

bootstrap().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});