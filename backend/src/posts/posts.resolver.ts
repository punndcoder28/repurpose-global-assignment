import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { PostType } from './dto/post.type';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Post } from './entities/post.entity';
import { UserType } from '../users/dto/user.type';

@Resolver(() => PostType)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Mutation(() => PostType)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: { id: number; email: string },
  ): Promise<PostType> {
    const post = await this.postsService.createPost(
      user.id,
      input.title,
      input.content,
    );

    // Fetch the post with author relation to return complete data
    const postWithAuthor = await this.postsService.findById(post.id);
    const result = this.toPostType(postWithAuthor);

    return result;
  }

  @Mutation(() => PostType)
  async updatePost(
    @Args('input') input: UpdatePostInput,
    @CurrentUser() user: { id: number; email: string },
  ): Promise<PostType> {
    const updates: Partial<{ title: string; content: string }> = {};

    if (input.title !== undefined) {
      updates.title = input.title;
    }

    if (input.content !== undefined) {
      updates.content = input.content;
    }

    const post = await this.postsService.updatePost(
      input.postId,
      user.id,
      updates,
    );

    // Fetch the post with author relation to return complete data
    const postWithAuthor = await this.postsService.findById(post.id);

    return this.toPostType(postWithAuthor);
  }

  @Query(() => [PostType])
  async posts(): Promise<PostType[]> {
    console.log('posts');
    const posts = await this.postsService.findAll();
    return posts.map((post) => this.toPostType(post));
  }

  @Query(() => PostType)
  async post(@Args('id', { type: () => Int }) id: number): Promise<PostType> {
    const post = await this.postsService.findById(id);
    return this.toPostType(post);
  }

  private toPostType(post: Post): PostType {
    if (!post) {
      return null;
    }
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: this.toUserType(post.author),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private toUserType(user: {
    id: number;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserType {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
