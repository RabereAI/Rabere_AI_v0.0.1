export enum UserRole {
    ADMIN = 'ADMIN',
    VETERINARIAN = 'VETERINARIAN',
    OPERATOR = 'OPERATOR',
    VIEWER = 'VIEWER'
}

export interface User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    subscribedDevices: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDto {
    email: string;
    password: string;
    role?: UserRole;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password'>;
} 