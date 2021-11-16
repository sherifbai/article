import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import JWT_SECRET from './JWT_SECRET';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existEmail = await this.userRepo.findOne({
      email: createUserDto.email,
    });

    if (existEmail) {
      throw new HttpException(
        'This email already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const existUsername = await this.userRepo.findOne({
      username: createUserDto.username,
    });

    if (existUsername) {
      throw new HttpException(
        'This username already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = new UserEntity();
    Object.assign(user, createUserDto);

    return await this.userRepo.save(user);
  }

  generateJWT(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJWT(user),
      },
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userRepo.findOne(
      { email: loginUserDto.email },
      { select: ['id', 'username', 'email', 'bio', 'image', 'password'] },
    );

    if (!user) {
      throw new HttpException('Email does not exist', HttpStatus.NOT_FOUND);
    }

    const isEqualPW = await compare(loginUserDto.password, user.password);

    if (!isEqualPW) {
      throw new HttpException(
        'Password does not match',
        HttpStatus.NON_AUTHORITATIVE_INFORMATION,
      );
    }

    delete user.password;

    return {
      user: {
        ...user,
        token: this.generateJWT(user),
      },
    };
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepo.findOne(id);
  }
}
