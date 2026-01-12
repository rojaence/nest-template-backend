import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { TranslationService } from './common/helpers/i18n-translation';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { MongoService } from './database/mongo/mongo.service';
import { LoggingService } from './common/services/logging/logging.service';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n/'),
        watch: true,
      },
      typesOutputPath: path.join(
        process.cwd(),
        'src/generated/i18n.generated.ts',
      ),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        switch (process.env.NODE_ENV) {
          case 'test':
            return '.env.test';
          case 'development':
            return '.env';
          default:
            return '.env';
        }
      })(),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TranslationService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    MailService,
    LoggingService,
    MongoService,
  ],
})
export class AppModule {}
