import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ObjectId } from 'mongodb';

export const OtpRevokeReason = {
  USED: 'used',
} as const;

export enum OtpProcessEnum {
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
}

export enum OtpProcessStatusEnum {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FINISHED = 'finished',
}

export interface OtpCode {
  _id?: ObjectId;
  userId: string;
  code: string;
  revokedAt: Date | null;
  processType: OtpProcessEnum;
  exp: Date;
  reason?: string;
}

export interface OtpProcess {
  _id?: ObjectId;
  userId: string;
  status: OtpProcessStatusEnum;
  processType: OtpProcessEnum;
  codeId: ObjectId;
  exp: Date;
}

export interface OtpToken {
  _id?: ObjectId;
  userId: string;
  processType: OtpProcessEnum;
  otpProcessId: ObjectId;
  code: string;
  exp: Date;
}

export class OtpVerifyCodeDTO {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6)
  code: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'change_password' })
  @IsEnum(OtpProcessEnum)
  processType: OtpProcessEnum;
}

export class OtpVerifyCodeEmailDTO extends OtpVerifyCodeDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class OtpGenerateCodeDTO {
  @ApiProperty({ example: 'change_password' })
  @IsNotEmpty()
  @IsEnum(OtpProcessEnum)
  processType: OtpProcessEnum;
}

export class OtpEmailGenerateCodeDTO extends OtpGenerateCodeDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class OtpStatusCodeDTO {
  @ApiProperty({ example: 'change_password' })
  @IsNotEmpty()
  @IsEnum(OtpProcessEnum)
  processType: OtpProcessEnum;
}

export class OtpVerifyTokenDTO {
  @ApiProperty({ example: 'token_string' })
  @IsNotEmpty()
  token: string;
  @IsNotEmpty()
  @ApiProperty({ example: 'change_password' })
  @IsEnum(OtpProcessEnum)
  processType: OtpProcessEnum;
}

export type OtpCodeCreateDTO = Omit<OtpCode, '_id'>;
export type OtpProcessCreateDTO = Omit<OtpProcess, '_id'> & {
  codeId: ObjectId;
};

export type OtpTokenCreateDTO = Omit<OtpToken, '_id'>;

export interface OtpVerifyCodeType {
  userId: string;
  code: string;
  processType: OtpProcessEnum;
}

export type OtpVerifyCodeEmailType = Omit<OtpVerifyCodeType, 'userId'> & {
  email: string;
};

export type OtpStatusCodeType = {
  userId: string;
  processType: OtpProcessEnum;
};

export type OtpVerifyTokenType = Pick<
  OtpToken,
  'userId' | 'processType' | 'otpProcessId'
> & {
  code: string;
};

export type OtpStatusProcessType = {
  userId: string;
  processType: OtpProcessEnum;
  codeId: ObjectId;
};
