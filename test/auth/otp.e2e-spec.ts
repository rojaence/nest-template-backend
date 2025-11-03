import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  OtpCode,
  OtpProcess,
  OtpProcessEnum,
  OtpProcessStatusEnum,
} from '@src/modules/auth/models/otp.interface';
import {
  defaultFakePassword,
  fakeAdminUser,
  FakeUserModel,
} from '@src/test/fakes/user';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { setupTestApp } from '../app-e2e-setup';
import { OtpService } from '@src/modules/auth/services/otp/otp.service';
import { OtpRepository } from '@src/modules/auth/repositories/otp.repository';
import { BcryptService } from '@src/common/services/bcrypt/bcrypt.service';
import { DateService } from '@src/common/services/date/date.service';
import { MailService } from '@src/mail/mail.service';
import { AuthRepository } from '@src/modules/auth/repositories/auth.repository';

interface GenerateOtpResponse {
  data: {
    success: string;
  };
}

interface TokenResponse {
  data: {
    accessToken: string;
  };
}

interface OtpVerifyResponse {
  data: {
    otpToken: string;
  };
}

describe('OtpController (e2e)', () => {
  let testApp: INestApplication<App>;
  let userData: FakeUserModel;
  let token: string;
  let otpService: OtpService;
  let otpRepository: OtpRepository;
  let bcryptService: BcryptService;
  let mailService: MailService;
  let dateService: DateService;
  let authRepository: AuthRepository;
  const otpCode = '111111';

  beforeAll(async () => {
    const { app, module } = await setupTestApp();
    otpService = module.get<OtpService>(OtpService);
    otpRepository = module.get<OtpRepository>(OtpRepository);
    bcryptService = module.get<BcryptService>(BcryptService);
    mailService = module.get<MailService>(MailService);
    dateService = module.get<DateService>(DateService);
    authRepository = module.get<AuthRepository>(AuthRepository);

    testApp = app;

    jest
      .spyOn(otpService, 'generateCode')
      .mockImplementation(
        async (userId: string, processType: OtpProcessEnum) => {
          const otp = otpCode;
          const code = await bcryptService.genPasswordHash(otp);
          const exp = dateService.addMinutes(new Date(), 3);
          const payload: OtpCode = {
            userId,
            code,
            processType,
            revokedAt: null,
            exp,
          };
          const otpDoc = await otpRepository.saveCode(payload);
          const process: OtpProcess = {
            userId,
            status: OtpProcessStatusEnum.PENDING,
            processType,
            codeId: otpDoc._id!,
            exp: dateService.addMinutes(new Date(), 5),
          };
          await otpRepository.saveProcess(process);
          const userData = await authRepository.findUserById(userId);
          await mailService.sendOtpEmail({
            to: userData!.email,
            processType,
            processCode: otp,
          });
          return true;
        },
      );
  });

  afterAll(async () => {
    await testApp.close();
  });

  beforeEach(async () => {
    userData = fakeAdminUser;
    const res = await request(testApp.getHttpServer())
      .post('/auth/login')
      .send({
        username: userData.username,
        password: defaultFakePassword,
      });
    const body = res.body as TokenResponse;
    token = body.data.accessToken;
  });

  it('/ (POST) should generate a otp code, verify and get otpToken', async () => {
    const res = await request(testApp.getHttpServer())
      .post('/otp/generate')
      .send({
        processType: OtpProcessEnum.CHANGE_PASSWORD,
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(HttpStatus.CREATED);
    const body = res.body as GenerateOtpResponse;
    expect(body.data.success).toBeDefined();

    const verify = await request(testApp.getHttpServer())
      .post('/otp/verify')
      .send({
        processType: OtpProcessEnum.CHANGE_PASSWORD,
        code: otpCode,
      })
      .set('Authorization', `Bearer ${token}`);

    const verifyBody = verify.body as OtpVerifyResponse;
    expect(verify.status).toBe(HttpStatus.OK);
    expect(verifyBody.data.otpToken).toBeDefined();
  });
});
