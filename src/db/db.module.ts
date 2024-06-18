import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.ENV_PG_HOST,
      port: Number(process.env.ENV_PG_PORT ?? 5432),
      username: process.env.ENV_PG_USERNAME,
      password: process.env.ENV_PG_PASSWORD,
      database: process.env.ENV_PG_DB,
      entities: [],
    }),
  ],
})
export class DbModule {}
