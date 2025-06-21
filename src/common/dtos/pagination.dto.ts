import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const PaginationSchema = z.object({
  page: z.number().min(1, { message: 'validation.too_small' }).optional().default(1),
  limit: z.number().min(1, { message: 'validation.too_small' }).optional().default(10),
  keyword: z.string().optional(),
  sort: z.string().optional(),
  filter: z.record(z.string()).optional(),
});

export class PaginationDto extends createZodDto(PaginationSchema) {
  @ApiProperty({
    description: 'The page number (optional, default: 1)',
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'The number of items per page (optional, default: 10)',
    example: 10,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Keyword to search across fields (optional)',
    example: 'john',
    required: false,
  })
  keyword?: string;

  @ApiProperty({
    description: 'Sort fields (e.g., "field1,-field2" for ascending/descending)',
    example: 'name,-createdAt',
    required: false,
  })
  sort?: string;

  @ApiProperty({
    description: 'Filter conditions as JSON (e.g., {"status": "active"})',
    example: '{"status": "active"}',
    required: false,
  })
  filter?: Record<string, string>;
}