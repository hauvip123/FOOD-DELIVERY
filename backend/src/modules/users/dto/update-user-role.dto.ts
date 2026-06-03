import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['customer', 'restaurant', 'admin'])
  role: string;
}
