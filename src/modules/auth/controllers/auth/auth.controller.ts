import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from '../../models/login.dto';
import { AuthService } from '../../services/auth/auth.service';
import { HttpResponse } from '@src/common/helpers/http-response';
import { TranslationService } from '@src/common/helpers/i18n-translation';
import { Response } from 'express';
import { AuthGuard } from '@src/common/guards/auth/auth.guard';
import { User } from '@src/common/decorators/user/user.decorator';
import { IJwtPayload, ResetPasswordDto } from '../../models/auth.interface';
import { JwtRevokeReason } from '../../models/jwt-blacklist.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly translation: TranslationService,
  ) {}

  @ApiOperation({ summary: 'Login with user credentials' })
  @ApiOkResponse({ description: 'Return an access token' })
  @ApiBadRequestResponse({ description: 'Invalid Credentials' })
  @Post('/login')
  async login(
    @Body() credentials: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authTokens = await this.authService.login(credentials);

    const result = HttpResponse.success({
      statusCode: HttpStatus.OK,
      data: authTokens,
      message: this.translation.t('validation.httpMessages.success') as string,
    });

    response.status(HttpStatus.OK).json(result);
  }

  @Get('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user authenticated profile' })
  @ApiOkResponse({ description: 'Return user profile data' })
  @ApiNotFoundResponse({ description: 'Not found profile data' })
  @UseGuards(AuthGuard)
  async profile(@User() user: IJwtPayload) {
    const userProfile = await this.authService.profile(user.username);
    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      data: userProfile,
      message: this.translation.t('validation.httpMessages.success') as string,
    });
  }

  @Post('/refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a new pair auth tokens' })
  @ApiOkResponse({ description: 'Return a pair tokens: access and refresh' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized response' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async refresh(@User() user: IJwtPayload) {
    const userProfile = await this.authService.profile(user.username);
    const refreshTokens = await this.authService.refreshAuth(
      user.jti!,
      userProfile,
    );
    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      data: {
        ...refreshTokens,
      },
      message: this.translation.t('validation.httpMessages.success') as string,
    });
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logout(
    @User() user: IJwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout({
      exp: new Date(user.exp! * 1000),
      jti: user.jti!,
      revokedAt: new Date(),
      userId: user.userId,
      reason: JwtRevokeReason.LOGOUT,
    });

    const result = HttpResponse.success({
      statusCode: HttpStatus.OK,
      message: this.translation.t('validation.httpMessages.success') as string,
    });

    response.status(HttpStatus.OK).json(result);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiOkResponse({ description: 'Return success message' })
  @ApiNotFoundResponse({ description: 'Not found profile data' })
  async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.authService.resetPassword(payload);
    return HttpResponse.success({
      statusCode: HttpStatus.OK,
      message: this.translation.t('validation.httpMessages.success') as string,
    });
  }
}
