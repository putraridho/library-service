import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './users.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
    controller = moduleRef.get<UserController>(UserController);
  });

  describe('findById', () => {
    it('should return an array of cats', () => {
      jest
        .spyOn(service, 'findById')
        .mockImplementation(() => 'This action returns user');
      expect(controller.findById()).toBe(true);
    });
  });
});
