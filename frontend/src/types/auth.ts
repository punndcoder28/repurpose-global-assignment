export interface UserType {
  id: number
  email: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: UserType
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
}
