import { registerAs } from '@nestjs/config';

export default registerAs('configuration', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  domain: process.env.DOMAIN || 'http://localhost',
  database: {
    url: process.env.DATABASE_URL,
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
  },
  token: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    openAi: process.env.OPENAI_TOKEN,
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
}));
