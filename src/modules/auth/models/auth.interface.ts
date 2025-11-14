import { ApiProperty } from '@nestjs/swagger';
import { JwtPayload } from 'jsonwebtoken';

export interface CredentialsI {
  username: string;
  password: string;
}

export interface IJwtPayload extends JwtPayload {
  username: string;
  userId: string;
}

export interface IDecodedToken {
  decoded: IJwtPayload | string | null;
  valid: boolean;
}

export interface AuthAccessDto {
  accessToken: string;
  refreshToken: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'your-email@example.com' })
  email: string;

  @ApiProperty({ example: 'your-otp-token' })
  otpToken: string;

  @ApiProperty({ example: 'new-password' })
  password: string;

  @ApiProperty({ example: 'new-password' })
  confirmPassword: string;
}

export type ResetPasswordType = InstanceType<typeof ResetPasswordDto>;
