import { IsNotEmpty } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  readonly title;

  @IsNotEmpty()
  readonly description;

  @IsNotEmpty()
  readonly body;

  readonly tagList?: string[];
}
