import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsInt,
  IsOptional,
} from 'class-validator';

@InputType()
export class UpdatePostInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  postId: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(10000)
  content?: string;
}
