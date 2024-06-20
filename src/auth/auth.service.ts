import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private authRepository: Repository<User>,
  ) {}

  async register(createUserDto: RegisterDto): Promise<void> {
    await this.authRepository.query(
      `INSERT INTO "user" 
        (name, email, password) 
      VALUES 
        ($1, $2, $3)`,
      [createUserDto.name, createUserDto.email, createUserDto.password],
    );
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const res = (await this.authRepository.query(
        `SELECT 
          uid,
          name,
          email,
          password,
          created_at,
          updated_at,
          deleted_at,
          is_verified
        FROM "user"
        WHERE email = $1`,
        [email.trim().toLowerCase()],
      )) as User[];

      const user = res.length > 0 ? res[0] : null;

      if (!user) {
        throw new HttpException(
          `${email} isn't registered`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!user.is_verified) {
        throw new HttpException(
          `${email} isn't verified`,
          HttpStatus.FORBIDDEN,
        );
      }

      if (!(await argon2.verify(String(user.password), password))) {
        throw new UnauthorizedException();
      }

      delete user.password;
      delete user.is_verified;

      return user;
    } catch (err) {
      throw new HttpException(
        'Something is wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginGoogle(name: string, email: string): Promise<User> {
    // -- CECK IF USER ALREADY EXISTS --
    const selectRes = (await this.authRepository.query(
      `SELECT
        uid,
        name,
        email,
        created_at,
        updated_at,
        deleted_at
      FROM "user"
      WHERE email = $1`,
      [email],
    )) as User[];

    let user = selectRes.length > 0 ? selectRes[0] : null;

    if (!user) {
      // -- REGISTER USER --
      const insertRes = (await this.authRepository.query(
        `INSERT INTO "user" 
          (name, email, is_verified) 
        VALUES 
          ($1, $2, TRUE)
        RETURNING
          uid,
          name,
          email,
          created_at,
          updated_at,
          deleted_at`,
        [name, email],
      )) as [User];

      user = insertRes[0];
    }

    return user;
  }
}
