export interface EnvironmentConfigI {
  JWT_SECRET: string;
  JWT_EXPIRATION: string | number;
  USER_DEFAULT_PASSWORD: string;
  DATABASE_URL: string;
  MONGO_DATABASE_URL: string;
  DEFAULT_LANGUAGE: string;
  COOKIE_EXPIRATION: number;
  JWT_REFRESH_EXPIRATION: string | number;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_SENDER: string;
}

const environment: EnvironmentConfigI = {
  USER_DEFAULT_PASSWORD: String(process.env.USER_DEFAULT_PASSWORD || ''),
  JWT_SECRET: String(process.env.JWT_SECRET || ''),
  JWT_EXPIRATION: process.env.JWT_EXPIRATION
    ? isNaN(Number(process.env.JWT_EXPIRATION))
      ? process.env.JWT_EXPIRATION
      : Number(process.env.JWT_EXPIRATION)
    : '1h',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION
    ? isNaN(Number(process.env.JWT_REFRESH_EXPIRATION))
      ? process.env.JWT_REFRESH_EXPIRATION
      : Number(process.env.JWT_REFRESH_EXPIRATION)
    : '2W',
  COOKIE_EXPIRATION: Number(process.env.COOKIE_EXPIRATION) || 3600,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`,
  MONGO_DATABASE_URL:
    process.env.MONGO_DATABASE_URL ||
    `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@localhost:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`,
  DEFAULT_LANGUAGE: String(process.env.DEFAULT_LANGUAGE || 'es'),
  MAIL_HOST: String(process.env.MAIL_HOST || ''),
  MAIL_PORT: Number(process.env.MAIL_PORT || ''),
  MAIL_USER: String(process.env.MAIL_USER || ''),
  MAIL_PASS: String(process.env.MAIL_PASS || ''),
  MAIL_SENDER: String(process.env.MAIL_SENDER || ''),
};

export default environment;
