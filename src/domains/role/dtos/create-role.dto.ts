import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateRoleSchema = z.object({
  name: z.string().nonempty({ message: 'validation.required' }),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {
  @ApiProperty({
    description: 'The name of the role',
    example: 'admin',
    required: true,
  })
  name: string;
}