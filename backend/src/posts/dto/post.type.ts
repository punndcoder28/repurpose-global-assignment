import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserType } from '../../users/dto/user.type';

@ObjectType()
export class PostType {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => UserType)
  author: UserType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
