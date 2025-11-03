import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { TranslationService } from '@src/common/helpers/i18n-translation';
import { Response } from 'express';

interface IErrorResponse {
  message: string[];
  error: string;
  statusCode: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(TranslationService)
    private readonly translationService: TranslationService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception.message || response.statusMessage;
    if (exception instanceof BadRequestException) {
      const responseError = exception.getResponse();
      const translatedMessage = this.translationService.t(
        'validation.httpMessages.badRequest',
      );
      if (typeof responseError === 'object') {
        const validationErrors = responseError as IErrorResponse;
        response.status(status).json({
          statusCode: status,
          message: validationErrors.message,
          error: translatedMessage,
        });
      } else if (typeof responseError === 'string') {
        response.status(status).json({
          statusCode: status,
          message: translatedMessage,
          error: responseError,
        });
      }
    } else if (exception instanceof NotFoundException) {
      const translatedMessage = this.translationService.t(
        'validation.httpMessages.resourceNotFound',
      );
      const responseError = exception.getResponse() as IErrorResponse;
      response.status(status).json({
        statusCode: status,
        message: translatedMessage,
        error: responseError.message,
      });
    } else {
      const responseError = {
        statusCode: status,
        message: message,
        error: exception.message,
      };
      response.status(status).json(responseError);
    }
  }
}
