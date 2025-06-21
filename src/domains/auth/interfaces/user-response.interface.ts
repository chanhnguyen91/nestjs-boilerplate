import { RoleEntity } from '../../role/entities/role.entity';

export interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  isVerified: boolean;
  roles?: RoleEntity[];
  createdAt: Date;
  updatedAt: Date;
}