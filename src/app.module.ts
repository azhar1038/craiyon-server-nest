import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '.env.development'],
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigType<typeof configuration>) => ({
        type: 'mysql',
        host: config.database.host,
        port: config.database.port,
        username: config.database.user,
        password: config.database.password,
        database: config.database.name,
        autoLoadEntities: true,
        synchronize: config.env === 'development',
      }),
      inject: [configuration.KEY],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
