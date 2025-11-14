import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@src/common/decorators/user/user.decorator';
import { AuthGuard } from '@src/common/guards/auth/auth.guard';
import { HttpResponse } from '@src/common/helpers/http-response';
import { IJwtPayload } from '../../models/auth.interface';
import {
  OtpEmailGenerateCodeDTO,
  OtpGenerateCodeDTO,
  OtpStatusCodeDTO,
  OtpVerifyCodeDTO,
  OtpVerifyCodeEmailDTO,
} from '../../models/otp.interface';
import { OtpService } from '../../services/otp/otp.service';
import { TranslationService } from '@src/common/helpers/i18n-translation';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('otp')
@ApiBearerAuth()
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly translation: TranslationService,
  ) {}
  @Post('/generate')
  @ApiOperation({ summary: 'Generate a new otp code and process' })
  @ApiOkResponse({ description: 'Return an otp valid code' })
  @ApiBadRequestResponse({ description: 'Otp code already exists' })
  @UseGuards(AuthGuard)
  async generateOtp(
    @User() user: IJwtPayload,
    @Body() otpPayload: OtpGenerateCodeDTO,
  ) {
    const success = await this.otpService.generateCode(
      user.userId,
      otpPayload.processType,
    );
    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      message: this.translation.t('validation.httpMessages.success') as string,
      data: { success },
    });
  }

  @Post('/verify')
  @ApiOperation({ summary: 'Update status otp code to verified' })
  @ApiOkResponse({ description: 'Return a boolean verified' })
  @ApiBadRequestResponse({ description: 'Invalid otp code' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async verifyOtp(
    @User() user: IJwtPayload,
    @Body() payload: OtpVerifyCodeDTO,
  ) {
    const { otpToken } = await this.otpService.verifyCodeByAccessToken({
      code: payload.code,
      userId: user.userId,
      processType: payload.processType,
    });

    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      message: this.translation.t('validation.httpMessages.success') as string,
      data: { otpToken },
    });
  }

  @Post('/active')
  @ApiOperation({ summary: 'Get status otp process' })
  @ApiOkResponse({ description: 'Return a boolean valid' })
  @ApiBadRequestResponse({ description: 'Invalid or expired otp process' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getActiveOtp(
    @User() user: IJwtPayload,
    @Body() payload: OtpStatusCodeDTO,
  ) {
    const validProccess = await this.otpService.statusActiveProcess({
      userId: user.userId,
      processType: payload.processType,
    });
    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      message: this.translation.t('validation.httpMessages.success') as string,
      data: { valid: validProccess.valid },
    });
  }

  @Post('/email/generate')
  @ApiOperation({ summary: 'Generate a new email otp code and process' })
  @ApiOkResponse({ description: 'Return an email otp valid code' })
  @ApiBadRequestResponse({ description: 'Email otp code already exists' })
  async generateEmailOtp(@Body() otpPayload: OtpEmailGenerateCodeDTO) {
    const success = await this.otpService.generateCodeByEmail(otpPayload);
    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      message: this.translation.t('validation.httpMessages.success') as string,
      data: { success },
    });
  }

  @Post('/email/verify')
  @ApiOperation({ summary: 'Update status otp code to verified' })
  @ApiOkResponse({ description: 'Return a boolean verified' })
  @ApiBadRequestResponse({ description: 'Invalid otp code' })
  @HttpCode(HttpStatus.OK)
  async verifyEmailOtp(@Body() payload: OtpVerifyCodeEmailDTO) {
    const { otpToken } = await this.otpService.verifyCodeByEmail({
      code: payload.code,
      email: payload.email,
      processType: payload.processType,
    });

    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      message: this.translation.t('validation.httpMessages.success') as string,
      data: { otpToken },
    });
  }
}
