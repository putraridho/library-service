import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'auth/auth.module';
import { CoreModule } from 'core/core.module';
import { DbModule } from 'db/db.module';
import { UserModule } from 'user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    CoreModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
