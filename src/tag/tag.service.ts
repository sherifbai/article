import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from './tag.entity';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/createTag.dto';
import { TagResponseInterface } from './types/tagResponse.interface';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepo: Repository<TagEntity>,
  ) {}

  async createTag(createTagDto: CreateTagDto): Promise<TagEntity> {
    const tag = new TagEntity();
    Object.assign(tag, createTagDto);

    return this.tagRepo.save(tag);
  }

  async getAll(): Promise<TagEntity[]> {
    return await this.tagRepo.find();
  }

  buildTagResponse(tags: TagEntity[]): TagResponseInterface {
    return { tags };
  }
}
