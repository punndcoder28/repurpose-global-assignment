import { Test, TestingModule } from '@nestjs/testing';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';

describe('PostsResolver', () => {
  let resolver: PostsResolver;
  let postsService: PostsService;

  const mockUser: User = {
    id: 1,
    email: 'author@example.com',
    password: 'hashedpassword',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    posts: [],
  };

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test Content',
    authorId: 1,
    author: mockUser,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPostsService = {
    createPost: jest.fn(),
    updatePost: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    validateOwnership: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    resolver = module.get<PostsResolver>(PostsResolver);
    postsService = module.get<PostsService>(PostsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createPost', () => {
    const currentUser = { id: 1, email: 'author@example.com' };

    it('should successfully create a post with valid input', async () => {
      const createInput: CreatePostInput = {
        title: 'New Post',
        content: 'New Content',
      };

      const createdPost = { ...mockPost, id: 2 };
      mockPostsService.createPost.mockResolvedValue(createdPost);
      mockPostsService.findById.mockResolvedValue(createdPost);

      const result = await resolver.createPost(createInput, currentUser);

      expect(postsService.createPost).toHaveBeenCalledWith(
        currentUser.id,
        createInput.title,
        createInput.content,
      );
      expect(postsService.findById).toHaveBeenCalledWith(createdPost.id);
      expect(result).toBeDefined();
      expect(result.title).toBe(createInput.title);
      expect(result.content).toBe(createInput.content);
    });

    it('should return correct response format', async () => {
      const createInput: CreatePostInput = {
        title: 'Test Title',
        content: 'Test Content',
      };

      mockPostsService.createPost.mockResolvedValue(mockPost);
      mockPostsService.findById.mockResolvedValue(mockPost);

      const result = await resolver.createPost(createInput, currentUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result.author).toHaveProperty('id');
      expect(result.author).toHaveProperty('email');
      expect(typeof result.id).toBe('number');
      expect(typeof result.title).toBe('string');
      expect(typeof result.content).toBe('string');
    });

    it('should associate post with current user', async () => {
      const createInput: CreatePostInput = {
        title: 'User Post',
        content: 'User Content',
      };

      mockPostsService.createPost.mockResolvedValue(mockPost);
      mockPostsService.findById.mockResolvedValue(mockPost);

      await resolver.createPost(createInput, currentUser);

      expect(postsService.createPost).toHaveBeenCalledWith(
        currentUser.id,
        expect.any(String),
        expect.any(String),
      );
    });

    it('should handle long title and content', async () => {
      const createInput: CreatePostInput = {
        title: 'A'.repeat(200),
        content: 'B'.repeat(5000),
      };

      const longPost = {
        ...mockPost,
        title: createInput.title,
        content: createInput.content,
      };
      mockPostsService.createPost.mockResolvedValue(longPost);
      mockPostsService.findById.mockResolvedValue(longPost);

      const result = await resolver.createPost(createInput, currentUser);

      expect(result.title).toBe(createInput.title);
      expect(result.content).toBe(createInput.content);
    });

    it('should handle special characters in title and content', async () => {
      const createInput: CreatePostInput = {
        title: 'Test <script>alert("xss")</script>',
        content: 'Content with émojis 🚀 and spëcial çhars!',
      };

      const specialPost = {
        ...mockPost,
        title: createInput.title,
        content: createInput.content,
      };
      mockPostsService.createPost.mockResolvedValue(specialPost);
      mockPostsService.findById.mockResolvedValue(specialPost);

      const result = await resolver.createPost(createInput, currentUser);

      expect(result.title).toBe(createInput.title);
      expect(result.content).toBe(createInput.content);
    });
  });

  describe('updatePost', () => {
    const currentUser = { id: 1, email: 'author@example.com' };

    it('should successfully update a post with valid input', async () => {
      const updateInput: UpdatePostInput = {
        postId: 1,
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const updatedPost = { ...mockPost, ...updateInput };
      mockPostsService.updatePost.mockResolvedValue(updatedPost);
      mockPostsService.findById.mockResolvedValue(updatedPost);

      const result = await resolver.updatePost(updateInput, currentUser);

      expect(postsService.updatePost).toHaveBeenCalledWith(
        updateInput.postId,
        currentUser.id,
        { title: updateInput.title, content: updateInput.content },
      );
      expect(result.title).toBe(updateInput.title);
      expect(result.content).toBe(updateInput.content);
    });

    it('should update only title when content is not provided', async () => {
      const updateInput: UpdatePostInput = {
        postId: 1,
        title: 'New Title Only',
      };

      const updatedPost = { ...mockPost, title: updateInput.title };
      mockPostsService.updatePost.mockResolvedValue(updatedPost);
      mockPostsService.findById.mockResolvedValue(updatedPost);

      const result = await resolver.updatePost(updateInput, currentUser);

      expect(postsService.updatePost).toHaveBeenCalledWith(
        updateInput.postId,
        currentUser.id,
        { title: updateInput.title },
      );
      expect(result.title).toBe(updateInput.title);
    });

    it('should update only content when title is not provided', async () => {
      const updateInput: UpdatePostInput = {
        postId: 1,
        content: 'New Content Only',
      };

      const updatedPost = { ...mockPost, content: updateInput.content };
      mockPostsService.updatePost.mockResolvedValue(updatedPost);
      mockPostsService.findById.mockResolvedValue(updatedPost);

      const result = await resolver.updatePost(updateInput, currentUser);

      expect(postsService.updatePost).toHaveBeenCalledWith(
        updateInput.postId,
        currentUser.id,
        { content: updateInput.content },
      );
      expect(result.content).toBe(updateInput.content);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      const updateInput: UpdatePostInput = {
        postId: 999,
        title: 'Updated Title',
      };

      mockPostsService.updatePost.mockRejectedValue(
        new NotFoundException('Post with ID 999 not found'),
      );

      await expect(
        resolver.updatePost(updateInput, currentUser),
      ).rejects.toThrow(NotFoundException);
      await expect(
        resolver.updatePost(updateInput, currentUser),
      ).rejects.toThrow('Post with ID 999 not found');
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      const updateInput: UpdatePostInput = {
        postId: 1,
        title: 'Unauthorized Update',
      };

      const unauthorizedUser = { id: 2, email: 'other@example.com' };

      mockPostsService.updatePost.mockRejectedValue(
        new ForbiddenException('You are not authorized to update this post'),
      );

      await expect(
        resolver.updatePost(updateInput, unauthorizedUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return correct response format after update', async () => {
      const updateInput: UpdatePostInput = {
        postId: 1,
        title: 'Updated',
      };

      const updatedPost = { ...mockPost, title: 'Updated' };
      mockPostsService.updatePost.mockResolvedValue(updatedPost);
      mockPostsService.findById.mockResolvedValue(updatedPost);

      const result = await resolver.updatePost(updateInput, currentUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('posts (query)', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        mockPost,
        { ...mockPost, id: 2, title: 'Second Post' },
        { ...mockPost, id: 3, title: 'Third Post' },
      ];

      mockPostsService.findAll.mockResolvedValue(mockPosts);

      const result = await resolver.posts();

      expect(postsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('author');
    });

    it('should return empty array when no posts exist', async () => {
      mockPostsService.findAll.mockResolvedValue([]);

      const result = await resolver.posts();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return posts with correct format', async () => {
      mockPostsService.findAll.mockResolvedValue([mockPost]);

      const result = await resolver.posts();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('author');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
      expect(result[0].author).toHaveProperty('email');
    });

    it('should handle multiple posts from different authors', async () => {
      const mockPosts = [
        mockPost,
        {
          ...mockPost,
          id: 2,
          authorId: 2,
          author: { ...mockUser, id: 2, email: 'user2@example.com' },
        },
      ];

      mockPostsService.findAll.mockResolvedValue(mockPosts);

      const result = await resolver.posts();

      expect(result).toHaveLength(2);
      expect(result[0].author.email).toBe('author@example.com');
      expect(result[1].author.email).toBe('user2@example.com');
    });
  });

  describe('post (single query)', () => {
    it('should return a single post by id', async () => {
      mockPostsService.findById.mockResolvedValue(mockPost);

      const result = await resolver.post(1);

      expect(postsService.findById).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostsService.findById.mockRejectedValue(
        new NotFoundException('Post with ID 999 not found'),
      );

      await expect(resolver.post(999)).rejects.toThrow(NotFoundException);
      await expect(resolver.post(999)).rejects.toThrow(
        'Post with ID 999 not found',
      );
    });

    it('should return post with author information', async () => {
      mockPostsService.findById.mockResolvedValue(mockPost);

      const result = await resolver.post(1);

      expect(result.author).toBeDefined();
      expect(result.author.id).toBe(mockUser.id);
      expect(result.author.email).toBe(mockUser.email);
    });

    it('should return correct response format', async () => {
      mockPostsService.findById.mockResolvedValue(mockPost);

      const result = await resolver.post(1);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('Error handling', () => {
    it('should propagate service errors correctly', async () => {
      const customError = new Error('Database connection failed');
      mockPostsService.findAll.mockRejectedValue(customError);

      await expect(resolver.posts()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle service returning null', async () => {
      mockPostsService.findById.mockResolvedValue(null);

      const result = await resolver.post(1);
      expect(result).toBeNull();
    });
  });

  describe('Data transformation', () => {
    it('should correctly transform Post entity to PostType', async () => {
      mockPostsService.findById.mockResolvedValue(mockPost);

      const result = await resolver.post(1);

      // Verify all fields are present and correctly typed
      expect(typeof result.id).toBe('number');
      expect(typeof result.title).toBe('string');
      expect(typeof result.content).toBe('string');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(typeof result.author.id).toBe('number');
      expect(typeof result.author.email).toBe('string');
    });

    it('should not expose sensitive user data', async () => {
      mockPostsService.findById.mockResolvedValue(mockPost);

      const result = await resolver.post(1);

      // Ensure password is not exposed
      expect(result.author).not.toHaveProperty('password');
    });
  });
});
