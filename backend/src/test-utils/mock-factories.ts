/**
 * Mock factories for testing
 * Provides reusable mock objects for tests
 */

export class MockFactories {
  /**
   * Creates a mock user object
   */
  static createMockUser(overrides?: Partial<any>) {
    return {
      id: 1,
      email: 'test@example.com',
      password: 'hashedpassword',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  /**
   * Creates a mock post object
   */
  static createMockPost(overrides?: Partial<any>) {
    const mockUser = this.createMockUser();
    return {
      id: 1,
      title: 'Test Post',
      content: 'Test Content',
      authorId: mockUser.id,
      author: mockUser,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    };
  }

  /**
   * Creates a mock auth response
   */
  static createMockAuthResponse(overrides?: Partial<any>) {
    return {
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
      user: this.createMockUser(),
      ...overrides,
    };
  }

  /**
   * Creates multiple mock posts
   */
  static createMockPosts(count: number, authorOverrides?: Partial<any>) {
    return Array.from({ length: count }, (_, index) =>
      this.createMockPost({
        id: index + 1,
        title: `Test Post ${index + 1}`,
        content: `Test Content ${index + 1}`,
        ...authorOverrides,
      }),
    );
  }

  /**
   * Creates a mock JWT payload
   */
  static createMockJwtPayload(overrides?: Partial<any>) {
    return {
      sub: 1,
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    };
  }
}
