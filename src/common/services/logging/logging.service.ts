import { HttpException, Injectable, Logger } from '@nestjs/common';
import { MongoService } from '@src/database/mongo/mongo.service';
import environment from '@src/environment/environment';
import { Request } from 'express';

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);
  constructor(private readonly mongoService: MongoService) {}

  async logError(exception: unknown, request: Request, status: number) {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      ip: request.ip,
      userAgent: request.get('user-agent') || 'Unknown',
      body: request.body as object,
      params: request.params,
      query: request.query,
      exception: exception,
    };
    await this.mongoService.collection('audit_logging').insertOne({
      errorDetails,
    });
    if (environment.NODE_ENV === 'production') return;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      this.logger.warn({
        ...errorDetails,
        message: exception.message,
        response,
      });
    } else if (exception instanceof Error) {
      this.logger.error({
        ...errorDetails,
        message: exception.message,
        stack: exception.stack,
      });
    } else {
      this.logger.error({
        ...errorDetails,
        exception: exception,
      });
    }
  }
}
