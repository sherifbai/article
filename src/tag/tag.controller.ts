import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/createTag.dto';
import { TagEntity } from './tag.entity';
import { TagResponseInterface } from './types/tagResponse.interface';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  async createTag(@Body() createTagDto: CreateTagDto): Promise<TagEntity> {
    return this.tagService.createTag(createTagDto);
  }

  @Get()
  async getAll(): Promise<TagResponseInterface> {
    const tags = await this.tagService.getAll();

    return this.tagService.buildTagResponse(tags);
  }
}
