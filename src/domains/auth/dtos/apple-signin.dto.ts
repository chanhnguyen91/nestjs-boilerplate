import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const AppleSignInSchema = z.object({
  idToken: z.string().nonempty({ message: 'validation.required' }),
  name: z.string().nonempty({ message: 'validation.required' }),
});

export class AppleSignInDto extends createZodDto(AppleSignInSchema) {
  @ApiProperty({
    description: 'The Apple ID token for authentication',
    example: 'apple_id_token',
    required: true,
  })
  idToken: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: true,
  })
  name: string;
}