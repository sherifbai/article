import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '../user/decorators/user.decorator';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { AuthGuard } from '../user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User('id') id: number,
    @Param() username: string,
  ): Promise<ProfileResponseInterface> {
    const user = await this.profileService.getProfile(id, username);

    return this.profileService.buildProfileResponse(user);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @Param() username: string,
    @User('id') userId: number,
  ): Promise<ProfileResponseInterface> {
    const user = await this.profileService.followProfile(userId, username);

    return this.profileService.buildProfileResponse(user);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unFollowProfile(
    @Param() username: string,
    @User('id') userId: number,
  ): Promise<ProfileResponseInterface> {
    const user = await this.profileService.unFollowProfile(userId, username);

    return this.profileService.buildProfileResponse(user);
  }
}
