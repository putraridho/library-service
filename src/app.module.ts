import { Module } from '@nestjs/common';
import { CoreModule } from 'core/core.module';
import { DbModule } from 'db/db.module';
import { UserModule } from 'user/user.module';

@Module({
  imports: [DbModule, CoreModule, UserModule],
})
export class AppModule {}
