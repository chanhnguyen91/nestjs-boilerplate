import { SetMetadata } from '@nestjs/common';
import { PERMISSION_NAME } from '../constants/permission.constant';

export const PERMISSION_KEY = 'permissions';
export const Permission = (
  options: { name: (typeof PERMISSION_NAME)[keyof typeof PERMISSION_NAME]; canRead?: boolean; canWrite?: boolean; canDelete?: boolean },
) => SetMetadata(PERMISSION_KEY, options);