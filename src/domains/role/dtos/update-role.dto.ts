import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateRoleSchema = z.object({
  name: z.string().nonempty({ message: 'validation.required' }).optional(),
});

export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {
  @ApiProperty({
    description: 'The new name of the role (optional)',
    example: 'moderator',
    required: false,
  })
  name?: string;
}