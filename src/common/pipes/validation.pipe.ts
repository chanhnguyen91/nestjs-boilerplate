// import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
// import { z } from 'zod';
// import { Reflector } from '@nestjs/core';
// import { I18nService } from '../services/i18n.service';
// import { ApiResponse } from '../interfaces/api-response.interface';

// @Injectable()
// export class ValidationPipe implements PipeTransform<any> {
//   constructor(private reflector: Reflector, private i18nService: I18nService) {}

//   transform(value: any, metadata: ArgumentMetadata) {
//     const { metatype } = metadata;
//     if (!metatype || !this.toValidate(metatype)) {
//       return value;
//     }

//     const schema = this.reflector.get<z.ZodTypeAny>('zod_schema', metatype);
//     if (!schema) {
//       return value;
//     }

//     try {
//       schema.parse(value);
//       return value;
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const errors = error.errors.map((e) => {
//           const params = { field: e.path[0] };
//           const errorCode = e.code;
//           const mappedKey = this.i18nService.mapZodErrorToKey(errorCode);
//           const translatedMessage = this.i18nService.translate(mappedKey, params);
//           return {
//             path: e.path.join('.'),
//             message: translatedMessage || e.message,
//           };
//         });

//         throw new BadRequestException({
//           success: false,
//           data: null,
//           error: {
//             statusCode: 400,
//             message: this.i18nService.translate('errors.validation'),
//             details: errors,
//           } as ApiResponse<null>['error'],
//         } as ApiResponse<null>);
//       }
//       throw new BadRequestException('Validation failed');
//     }
//   }

//   private toValidate(metatype: Function): boolean {
//     const types: Function[] = [String, Boolean, Number, Array, Object];
//     return !types.includes(metatype);
//   }
// }
