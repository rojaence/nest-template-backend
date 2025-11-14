import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpRepository } from '@auth/repositories/otp.repository';
import { BcryptService } from '@src/common/services/bcrypt/bcrypt.service';
import { randomInt, randomBytes } from 'crypto';
import { DateService } from '@src/common/services/date/date.service';
import { TranslationService } from '@src/common/helpers/i18n-translation';
import {
  OtpCode,
  OtpEmailGenerateCodeDTO,
  OtpProcess,
  OtpProcessEnum,
  OtpProcessStatusEnum,
  OtpStatusCodeType,
  OtpVerifyCodeEmailType,
  OtpVerifyCodeType,
  OtpVerifyTokenType,
} from '@auth/models/otp.interface';
import { MailService } from '@src/mail/mail.service';
import { AuthRepository } from '../../repositories/auth.repository';
import { WithId } from 'mongodb';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly bcryptService: BcryptService,
    private readonly dateService: DateService,
    private readonly mailService: MailService,
    private readonly authRepository: AuthRepository,
    private readonly translation: TranslationService,
  ) {}
  async generateCode(userId: string, processType: OtpProcessEnum) {
    const exists = await this.otpRepository.findActiveCode({
      userId,
      processType,
    });
    if (exists) {
      const isBefore = this.isBeforeTimeout(exists);
      if (isBefore) {
        throw new BadRequestException(
          this.translation.t('auth.otp.alreadySent'),
        );
      }
      await this.invalidateLastCode(exists);
    }
    const otp = randomInt(999999).toString().padStart(6, '0');
    const code = await this.bcryptService.genPasswordHash(otp);
    const exp = this.dateService.addMinutes(new Date(), 3);
    const payload: OtpCode = {
      userId,
      code,
      processType,
      createdAt: new Date(),
      revokedAt: null,
      exp,
    };
    const otpDoc = await this.otpRepository.saveCode(payload);
    const process: OtpProcess = {
      userId,
      status: OtpProcessStatusEnum.PENDING,
      processType,
      codeId: otpDoc._id!,
      exp: this.dateService.addMinutes(new Date(), 5),
    };
    await this.otpRepository.saveProcess(process);
    const userData = await this.authRepository.findUserById(userId);
    await this.mailService.sendOtpEmail({
      to: userData!.email,
      processType,
      processCode: otp,
    });
    return true;
  }

  async generateCodeByEmail(payload: OtpEmailGenerateCodeDTO) {
    const user = await this.authRepository.findUserByEmail(payload.email);
    if (!user) {
      return true;
    }
    return this.generateCode(user.id, payload.processType);
  }

  async verifyCodeByAccessToken(payload: OtpVerifyCodeType) {
    return await this.verifyCode(payload);
  }

  async verifyCodeByEmail(payload: OtpVerifyCodeEmailType) {
    const user = await this.authRepository.findUserByEmail(payload.email);
    if (!user) {
      throw new BadRequestException(
        this.translation.t('validation.httpMessages.unauthorized'),
      );
    }
    return await this.verifyCode({
      ...payload,
      userId: user.id,
    });
  }

  async verifyCode(payload: OtpVerifyCodeType) {
    const exists = await this.otpRepository.findActiveCode({
      processType: payload.processType,
      userId: payload.userId,
    });
    if (!exists) {
      throw new BadRequestException(this.translation.t('auth.otp.invalid'));
    }
    const verify = await this.bcryptService.chechPasswordHash(
      payload.code,
      exists.code,
    );
    if (!verify)
      throw new BadRequestException(this.translation.t('auth.otp.invalid'));
    const process = await this.otpRepository.findActiveProcess({
      codeId: exists._id,
      processType: exists.processType,
      userId: exists.userId,
    });
    await this.otpRepository.setActiveProcessStatus(
      process!._id,
      OtpProcessStatusEnum.VERIFIED,
    );
    await this.otpRepository.revokeCode(exists._id);
    const otpToken = this.generateOtpToken();
    await this.otpRepository.saveOtpToken({
      otpProcessId: process!._id,
      processType: exists.processType,
      code: await this.bcryptService.genPasswordHash(otpToken),
      userId: exists.userId,
      exp: this.dateService.addMinutes(new Date(), 10),
    });
    return {
      otpToken,
    };
  }

  async statusActiveProcess(payload: OtpStatusCodeType) {
    const exists = await this.otpRepository.findVerifiedProcess(payload);
    if (!exists)
      throw new BadRequestException(
        this.translation.t('auth.otp.invalidProcess'),
      );
    const valid = this.dateService.isBefore(new Date(), exists.exp);
    if (!valid)
      throw new BadRequestException(
        this.translation.t('auth.otp.invalidProcess'),
      );
    return {
      valid,
      otpProccessId: exists._id,
    };
  }

  async verifyOtpToken(payload: OtpVerifyTokenType) {
    const token = await this.otpRepository.findOtpToken(payload);
    if (!token) {
      throw new BadRequestException(this.translation.t('auth.otp.invalid'));
    }
    const valid = await this.bcryptService.chechPasswordHash(
      payload.code,
      token.code,
    );
    if (!valid) {
      throw new BadRequestException(
        this.translation.t('auth.otp.invalidProcess'),
      );
    }
    await this.otpRepository.revokeToken(token._id);
    return {
      valid,
    };
  }

  private generateOtpToken(size: number = 16) {
    const token = randomBytes(size).toString('hex');
    return token;
  }

  async invalidateLastCode(payload: WithId<OtpCode>) {
    const process = await this.otpRepository.findActiveProcess({
      codeId: payload._id,
      processType: payload.processType,
      userId: payload.userId,
    });
    if (process)
      await this.otpRepository.setActiveProcessStatus(
        process._id,
        OtpProcessStatusEnum.FINISHED,
      );
    await this.otpRepository.revokeCode(payload._id);
    const otpToken = await this.otpRepository.findOtpTokenActive({
      processType: payload.processType,
      userId: payload.userId,
    });
    if (otpToken) await this.otpRepository.revokeToken(otpToken._id);
  }

  isBeforeTimeout(otpCode: WithId<OtpCode>) {
    const timeoutEnd = this.dateService.addMinutes(otpCode.createdAt, 1);
    return this.dateService.isBefore(new Date(), timeoutEnd);
  }
}
