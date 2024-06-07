import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get()
  findById(): boolean {
    return true;
  }
}
