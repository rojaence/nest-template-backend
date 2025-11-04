import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { execSync } from 'child_process';
import { App } from 'supertest/types';
import * as cookieParser from 'cookie-parser';
import { MailService } from '@src/mail/mail.service';
import { MockMailService } from './mocks/mail.service.mock';

interface SetupTestAppI {
  app: INestApplication<App>;
  module: TestingModule;
}

export const setupTestApp = async (): Promise<SetupTestAppI> => {
  try {
    execSync('npm run seed:test -- --reset', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error al ejecutar seed:test:', error);
    process.exit(1);
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useClass(MockMailService)
    .compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useLogger(['log']);
  await app.init();
  return { app, module: moduleFixture };
};
