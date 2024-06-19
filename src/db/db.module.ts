import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('ENV_PG_HOST'),
        port: configService.get<number>('ENV_PG_PORT', 5432),
        username: configService.get<string>('ENV_PG_USERNAME'),
        password: configService.get<string>('ENV_PG_PASSWORD'),
        database: configService.get<string>('ENV_PG_DB'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migration/*{.ts,.js}'],
        migrationsRun: true,
        migrationsTransactionMode: 'all',
        autoLoadEntities: true,
        synchronize: false,
        cache: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DbModule {}
