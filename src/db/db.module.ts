import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.ENV_PG_HOST,
      port: Number(process.env.ENV_PG_PORT ?? 5432),
      username: process.env.ENV_PG_USERNAME,
      password: process.env.ENV_PG_PASSWORD,
      database: process.env.ENV_PG_DB,
      models: [],
    }),
  ],
})
export class DbModule {}
