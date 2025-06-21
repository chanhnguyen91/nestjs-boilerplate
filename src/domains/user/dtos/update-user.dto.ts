import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateUserSchema = z.object({
  email: z.string().email({ message: 'validation.invalid_email' }).optional(),
  password: z.string().min(6, { message: 'validation.too_small' }).optional(),
  name: z.string().nonempty({ message: 'validation.required' }).optional(),
  isVerified: z.boolean().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {
  @ApiProperty({
    description: 'The new email address of the user (optional)',
    example: 'newuser@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'The new password for the user (optional)',
    example: 'newpassword123',
    required: false,
  })
  password?: string;

  @ApiProperty({
    description: 'The new name of the user (optional)',
    example: 'Jane Doe',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Whether the user is verified (optional)',
    example: true,
    required: false,
  })
  isVerified?: boolean;
}