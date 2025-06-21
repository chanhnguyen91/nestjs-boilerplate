import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { RegisterDto, LoginDto, AppleSignInDto, ResetPasswordDto } from '../dtos';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Logger } from 'winston';
import { TOKEN_EXPIRATION } from '../../../common/constants';
import {
  conflict,
  unauthorized,
  notFound,
  accessDenied,
} from '../../../common/utils/error.utils';

import { UserResponse, TokensResponse, PasswordResetRequestResponse } from '../interfaces';
import { RoleEntity } from '../../role/entities/role.entity';
import { ROLES } from '../../../common/constants/roles.constant';

import { Transactional } from 'typeorm-transactional';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Transactional()
  async register(registerDto: RegisterDto): Promise<UserResponse> {
    const { email, password, name } = registerDto;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw conflict('errors.duplicate_email', undefined, [
        {
          key: 'errors.email_already_exists',
          params: { email },
          path: 'email',
        },
      ]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword, name, isVerified: true });
    const savedUser = await this.userRepository.save(user);

    const streamerRole = await this.roleRepository.findOne({ where: { name: ROLES.STREAMER } });
    if (!streamerRole) {
      throw notFound('errors.not_found', undefined, [
        {
          key: 'errors.role_not_found',
          params: { role: ROLES.STREAMER },
          path: 'role',
        },
      ]);
    }

    savedUser.roles = [streamerRole];
    await this.userRepository.save(savedUser);

    this.logger.info(`User registered: ${email} with role: ${ROLES.STREAMER}`);
    return this.transformUserEntityToResponse(savedUser);
  }

  transformUserEntityToResponse(user: UserEntity): UserResponse {
    const { password, refreshTokens, ...rest } = user;
    return rest;
  }

  async login(loginDto: LoginDto): Promise<TokensResponse> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.rolePermissions', 'roles.rolePermissions.permission'],
    });
    if (!user) {
      throw notFound('errors.user_not_found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw unauthorized('errors.credential_invalid');
    }
    if (!user.isVerified) {
      throw accessDenied('errors.unverified');
    }

    this.logger.info(`User logged in: ${email}`);
    return this.generateTokens(user);
  }

  @Transactional()
  async refreshToken(token: string): Promise<TokensResponse> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw accessDenied('errors.invalid_token');
    }

    await this.refreshTokenRepository.remove(refreshToken);

    const user = await this.userRepository.findOne({
      where: { id: refreshToken.user.id },
      relations: ['roles', 'roles.rolePermissions', 'roles.rolePermissions.permission'],
    });
    if (!user) {
      throw notFound('errors.user_not_found');
    }

    this.logger.info(`Token refreshed for user: ${user.email}`);
    return this.generateTokens(user);
  }

  @Transactional()
  async googleLogin(user: any): Promise<TokensResponse> {
    let dbUser = await this.userRepository.findOne({
      where: { email: user.email },
      relations: ['roles', 'roles.rolePermissions', 'roles.rolePermissions.permission'],
    });
    if (!dbUser) {
      dbUser = this.userRepository.create({
        email: user.email,
        name: user.name,
        isVerified: true,
      });
      const savedNewUser = await this.userRepository.save(dbUser);

      const streamerRole = await this.roleRepository.findOne({ where: { name: ROLES.STREAMER } });
      if (streamerRole) {
        savedNewUser.roles = [streamerRole];
        await this.userRepository.save(savedNewUser);
      } else {
        throw notFound('errors.not_found', undefined, [
          {
            key: 'errors.role_not_found',
            params: { role: ROLES.STREAMER },
            path: 'role',
          },
        ]);
      }
      dbUser = savedNewUser;
    }

    this.logger.info(`Google login for user: ${user.email}`);
    return this.generateTokens(dbUser);
  }

  @Transactional()
  async appleSignIn(appleSignInDto: AppleSignInDto): Promise<TokensResponse> {
    const { idToken, name } = appleSignInDto;
    const appleUserEmail = 'extracted_email_from_apple_id_token@example.com';

    let dbUser = await this.userRepository.findOne({
      where: { email: appleUserEmail },
      relations: ['roles', 'roles.rolePermissions', 'roles.rolePermissions.permission'],
    });
    if (!dbUser) {
      dbUser = this.userRepository.create({ email: appleUserEmail, name, isVerified: true });
      const savedNewUser = await this.userRepository.save(dbUser);

      const streamerRole = await this.roleRepository.findOne({ where: { name: ROLES.STREAMER } });
      if (streamerRole) {
        savedNewUser.roles = [streamerRole];
        await this.userRepository.save(savedNewUser);
      } else {
        throw notFound('errors.not_found', undefined, [
          {
            key: 'errors.role_not_found',
            params: { role: ROLES.STREAMER },
            path: 'role',
          },
        ]);
      }
      dbUser = savedNewUser;
    }

    this.logger.info(`Apple sign-in for user: ${name}`);
    return this.generateTokens(dbUser);
  }

  async requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw notFound('errors.not_found', undefined, [
        {
          key: 'errors.user_with_email_not_found',
          params: { email },
          path: 'email',
        },
      ]);
    }

    const resetToken = this.jwtService.sign({ email }, { expiresIn: '1h' });
    this.logger.info(`Password reset requested for: ${email}`);
    return { message: 'Password reset email sent', resetToken };
  }

  @Transactional()
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, token, newPassword } = resetPasswordDto;
    try {
      this.jwtService.verify(token, { ignoreExpiration: false });
    } catch (error) {
      throw accessDenied('errors.invalid_token');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw notFound('errors.not_found', undefined, [
        {
          key: 'errors.user_with_email_not_found',
          params: { email },
          path: 'email',
        },
      ]);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    this.logger.info(`Password reset successfully for: ${email}`);
  }

  private async generateTokens(user: UserEntity): Promise<TokensResponse> {
    const roles = await user.roles || [];
    const permissions = await Promise.all(
      roles.map(async (role) => {
        const rolePermissions = await role.rolePermissions || [];
        return rolePermissions
          .filter(rp => rp.canRead || rp.canWrite || rp.canDelete)
          .map(rp => rp.permission ? rp.permission.name : '');
      })
    ).then(perms => perms.flat().filter(p => p));

    const payload = {
      sub: user.id,
      email: user.email,
      permissions: permissions.length > 0 ? permissions : [],
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${TOKEN_EXPIRATION.REFRESH_TOKEN_DAYS}d`,
    });

    const tokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      user,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRATION.REFRESH_TOKEN_DAYS * TOKEN_EXPIRATION.MILLISECONDS_PER_DAY).toISOString(),
    });
    await this.refreshTokenRepository.save(tokenEntity);

    return { accessToken, refreshToken };
  }
}