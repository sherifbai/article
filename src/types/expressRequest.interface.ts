import { UserEntity } from '../user/user.entity';
import e, { Request } from 'express';

export interface ExpressRequestInterface extends Request {
  user?: UserEntity;
}
