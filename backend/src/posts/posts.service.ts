import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async createPost(
    authorId: number,
    title: string,
    content: string,
  ): Promise<Post> {
    const post = this.postRepository.create({
      title,
      content,
      authorId,
    });

    return await this.postRepository.save(post);
  }

  async updatePost(
    postId: number,
    authorId: number,
    updates: Partial<{ title: string; content: string }>,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (post.authorId !== authorId) {
      throw new ForbiddenException(
        'You are not authorized to update this post',
      );
    }

    if (updates.title !== undefined) {
      post.title = updates.title;
    }

    if (updates.content !== undefined) {
      post.content = updates.content;
    }

    return await this.postRepository.save(post);
  }

  async findById(postId: number): Promise<Post | null> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return post;
  }

  async findAll(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['author'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async validateOwnership(postId: number, userId: number): Promise<boolean> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return post.authorId === userId;
  }
}
