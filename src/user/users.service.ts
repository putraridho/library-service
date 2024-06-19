import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    let users: User[] = [];
    const res = (await this.userRepository.query(
      `SELECT 
        uid,
        name,
        email,
        created_at,
        updated_at
      FROM "user"
      WHERE deleted_at IS NULL`,
    )) as User[];

    if (res.length > 0) {
      users = res;
    }

    return users;
  }

  async findById(uid: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.uid = :uid', { uid })
      .getOne();
  }

  async delete(uid: string): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .softDelete()
      .where('uid = :uid', { uid })
      .execute();
  }
}
