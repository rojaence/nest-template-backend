import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { DynamicModule } from '@nestjs/common';
import { TranslationService } from '@src/common/helpers/i18n-translation';
import { PrismaService } from '@src/database/prisma/prisma.service';
import { MockPrismaService } from '@src/database/mocks/prismaClient/mockPrisma.service';
import { JwtService } from '@src/modules/auth/services/jwt/jwt.service';
import { BcryptService } from '@src/common/services/bcrypt/bcrypt.service';
import { MongoService } from '@src/database/mongo/mongo.service';
import { MockMongoService } from '@src/database/mocks/mongo-client/mock-mongo.service';
import { DateService } from '@src/common/services/date/date.service';
import { MailService } from '@src/mail/mail.service';
import { MockMailService } from '../../../../test/mocks/mail.service.mock';
import { OtpService } from '@src/modules/auth/services/otp/otp.service';
import { OtpRepository } from '@src/modules/auth/repositories/otp.repository';
import { AuthRepository } from '@src/modules/auth/repositories/auth.repository';

export class BaseUnitTestModule {
  static forRoot(): DynamicModule {
    return {
      module: BaseUnitTestModule,
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: 'es',
          loaderOptions: {
            path: path.join(__dirname, '../../../i18n'),
            watch: false,
          },
          resolvers: [
            { use: QueryResolver, options: ['lang'] },
            AcceptLanguageResolver,
          ],
        }),
      ],
      providers: [
        TranslationService,
        {
          provide: PrismaService,
          useClass: MockPrismaService,
        },
        {
          provide: MongoService,
          useClass: MockMongoService,
        },
        BcryptService,
        JwtService,
        OtpService,
        OtpRepository,
        AuthRepository,
        DateService,
        {
          provide: MailService,
          useClass: MockMailService,
        },
      ],
      exports: [
        I18nModule,
        TranslationService,
        PrismaService,
        BcryptService,
        JwtService,
        OtpService,
        MongoService,
        DateService,
        MailService,
      ],
    };
  }
}
