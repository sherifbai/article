import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getAll(userId: number, query: any): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.author) {
      const author = await this.userRepo.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.favourited) {
      const user = await this.userRepo.findOne(
        {
          username: query.favourited,
        },
        {
          relations: ['favourites'],
        },
      );

      const ids = user.favourites.map((el) => el.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (query.tagList) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articlesCount = await queryBuilder.getCount();

    let favouriteIds: number[] = [];

    if (userId) {
      const user = await this.userRepo.findOne(userId, {
        relations: ['favourites'],
      });
      favouriteIds = user.favourites.map((ids) => ids.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorites = articles.map((article) => {
      const favourite = favouriteIds.includes(article.id);

      return { ...article, favourite };
    });

    return { articles: articlesWithFavorites, articlesCount };
  }

  async getFeed(
    userId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const user = await this.userRepo.findOne(
      { id: userId },
      { relations: ['followers'] },
    );

    if (user.followers.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingIds = user.followers.map((el) => el.id);
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingIds });

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.limit(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async addToFavourite(
    userId: number,
    articleId: number,
  ): Promise<ArticleEntity> {
    const article = await this.articleRepo.findOne(articleId);
    const user = await this.userRepo.findOne(userId, {
      relations: ['favourites'],
    });
    if (!article) {
      throw new HttpException('Article does not found', HttpStatus.NOT_FOUND);
    }

    const isNotFavourite =
      user.favourites.findIndex(
        (articlesInFavourite) => articlesInFavourite.id === article.id,
      ) === -1;

    if (isNotFavourite) {
      user.favourites.push(article);
      article.favouritesCount++;
      await this.articleRepo.save(article);
      await this.userRepo.save(user);
    }

    return article;
  }

  async deleteFromFavourite(
    userId: number,
    id: number,
  ): Promise<ArticleEntity> {
    const article = await this.articleRepo.findOne(id);
    const user = await this.userRepo.findOne(userId, {
      relations: ['favourites'],
    });

    if (!article) {
      throw new HttpException('Article does not found', HttpStatus.NOT_FOUND);
    }

    const articleIndex = user.favourites.findIndex(
      (articleInFavourite) => articleInFavourite.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favourites.splice(articleIndex, 1);
      article.favouritesCount--;
      await this.articleRepo.save(article);
      await this.userRepo.save(user);
    }

    return article;
  }

  async createArticle(user: UserEntity, createArticleDto: CreateArticleDto) {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = slugify(article.title, { lower: true });
    article.author = user;

    return await this.articleRepo.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  async getSingleArticle(id: number): Promise<ArticleEntity> {
    return await this.articleRepo.findOne(id);
  }

  async deleteArticle(id: number, userId: number): Promise<DeleteResult> {
    const article = await this.articleRepo.findOne(id);

    if (!article) {
      throw new HttpException('Article does not found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== userId) {
      throw new HttpException(
        'You have not permission to delete this article',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.articleRepo.delete(id);
  }

  async updateArticle(
    id: number,
    userId: number,
    updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.articleRepo.findOne(id);

    if (!article) {
      throw new HttpException('Article does not found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== userId) {
      throw new HttpException(
        'You have not permission to update this article',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepo.save(article);
  }
}
