import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateUserSchema = z.object({
  email: z.string().email({ message: 'validation.invalid_email' }).nonempty({ message: 'validation.required' }),
  password: z.string().min(6, { message: 'validation.too_small' }).nonempty({ message: 'validation.required' }),
  name: z.string().nonempty({ message: 'validation.required' }),
  isVerified: z.boolean().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'The password for the user',
    example: 'password123',
    required: true,
  })
  password: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Whether the user is verified (optional)',
    example: true,
    required: false,
  })
  isVerified?: boolean;
}