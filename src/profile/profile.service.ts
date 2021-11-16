import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { ProfileType } from './types/profile.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getProfile(userId: number, username: string): Promise<ProfileType> {
    const profile = await this.userRepo.findOne(username);
    const user = await this.userRepo.findOne(userId, {
      relations: ['followers'],
    });

    if (!userId) {
      return { ...profile, following: false };
    }

    if (!profile) {
      throw new HttpException('Profile does not found', HttpStatus.NOT_FOUND);
    }

    const isFollow =
      user.followers.findIndex((el) => el.id === profile.id) === -1;

    if (!isFollow) {
      return { ...profile, following: true };
    }

    return { ...profile, following: false };
  }

  async followProfile(id: number, username: string): Promise<ProfileType> {
    const follower = await this.userRepo.findOne(id, {
      relations: ['followers'],
    });

    const following = await this.userRepo.findOne(username);

    if (!following) {
      throw new HttpException('Profile does not found', HttpStatus.NOT_FOUND);
    }

    if (id === following.id) {
      throw new HttpException(
        'Follower and following id must be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isFollowed =
      follower.followers.findIndex((el) => el.id === following.id) === -1;

    if (!isFollowed) {
      throw new HttpException(
        'You are already followed',
        HttpStatus.BAD_REQUEST,
      );
    }

    follower.followers.push(following);
    await this.userRepo.save(follower);

    return { ...following, following: true };
  }

  async unFollowProfile(
    userId: number,
    username: string,
  ): Promise<ProfileType> {
    const follower = await this.userRepo.findOne(userId, {
      relations: ['followers'],
    });

    const following = await this.userRepo.findOne(username);

    if (!following) {
      throw new HttpException('Profile does not found', HttpStatus.NOT_FOUND);
    }

    const followingId = follower.followers.findIndex(
      (el) => el.id === following.id,
    );

    if (followingId >= 0) {
      follower.followers.splice(followingId, 1);
      await this.userRepo.save(follower);
    } else {
      throw new HttpException(
        'You are not followed for this profile',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { ...following, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
}
