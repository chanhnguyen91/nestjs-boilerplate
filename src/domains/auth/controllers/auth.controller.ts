import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, AppleSignInDto, ResetPasswordDto } from '../dtos';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ApiResponse as CustomApiResponse } from '../../../common/interfaces/api-response.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto): Promise<CustomApiResponse<any>> {
    const user = await this.authService.register(registerDto);
    return { success: true, data: user, error: null };
  }

  @Post('login')
  @Public()
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() loginDto: LoginDto): Promise<CustomApiResponse<any>> {
    const tokens = await this.authService.login(loginDto);
    return { success: true, data: tokens, error: null };
  }

  @Post('refresh')
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  async refreshToken(@Body('refreshToken') token: string): Promise<CustomApiResponse<any>> {
    const tokens = await this.authService.refreshToken(token);
    return { success: true, data: tokens, error: null };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @Public()
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  @Public()
  @ApiResponse({ status: 200, description: 'Google login successful' })
  async googleAuthRedirect(@Req() req): Promise<CustomApiResponse<any>> {
    const user = await this.authService.googleLogin(req.user);
    return { success: true, data: user, error: null };
  }

  @Post('apple')
  @Public()
  @ApiResponse({ status: 200, description: 'Apple Sign-in successful' })
  async appleSignIn(@Body() appleSignInDto: AppleSignInDto): Promise<CustomApiResponse<any>> {
    const user = await this.authService.appleSignIn(appleSignInDto);
    return { success: true, data: user, error: null };
  }

  @Post('password/reset/request')
  @Public()
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async requestPasswordReset(@Body('email') email: string): Promise<CustomApiResponse<any>> {
    const result = await this.authService.requestPasswordReset(email);
    return { success: true, data: result, error: null };
  }

  @Post('password/reset')
  @Public()
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<CustomApiResponse<void>> {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return { success: true, data: result, error: null };
  }
}
