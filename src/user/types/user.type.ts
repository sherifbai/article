import { UserEntity } from '../user.entity';

export type UserType = Omit<UserEntity, 'hashPW'>;
