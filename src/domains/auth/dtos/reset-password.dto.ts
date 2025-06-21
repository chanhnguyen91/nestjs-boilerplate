import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: 'validation.invalid_email' }).nonempty({ message: 'validation.required' }),
  token: z.string().nonempty({ message: 'validation.required' }),
  newPassword: z.string().min(6, { message: 'validation.too_small' }).nonempty({ message: 'validation.required' }),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'The reset token received via email',
    example: 'reset_token',
    required: true,
  })
  token: string;

  @ApiProperty({
    description: 'The new password for the user',
    example: 'newpassword123',
    required: true,
  })
  newPassword: string;
}