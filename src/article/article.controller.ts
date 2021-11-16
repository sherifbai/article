import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '../user/guards/auth.guard';
import { UserEntity } from '../user/user.entity';
import { User } from '../user/decorators/user.decorator';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getAll(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.getAll(userId, query);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return this.articleService.getFeed(userId, query);
  }

  @Post(':id/favourite')
  @UseGuards(AuthGuard)
  async addToFavourite(
    @User('id') userId: number,
    @Param('id') id: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addToFavourite(userId, id);

    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':id/favourite')
  @UseGuards(AuthGuard)
  async deleteFromFavourite(
    @User('id') userId: number,
    @Param('id') id: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteFromFavourite(userId, id);

    return this.articleService.buildArticleResponse(article);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':id')
  async getSingleArticle(
    @Param('id') id: number,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getSingleArticle(id);

    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteArticle(@Param('id') id: number, @User('id') userId: number) {
    return this.articleService.deleteArticle(id, userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @Param('id') id: number,
    @User('id') userId: number,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(
      id,
      userId,
      updateArticleDto,
    );

    return this.articleService.buildArticleResponse(article);
  }
}
