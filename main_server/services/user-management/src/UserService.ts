import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private readonly notificationService: NotificationService
    ) {}

    async createUser(userData: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            role: UserRole.VIEWER
        });

        return this.userRepository.save(user);
    }

    async login(credentials: LoginDto): Promise<AuthResponse> {
        const user = await this.validateUser(credentials);
        const token = await this.generateToken(user);

        return {
            token,
            user: this.sanitizeUser(user)
        };
    }

    async subscribeToDevice(userId: string, deviceId: string): Promise<void> {
        await this.userRepository.update(userId, {
            subscribedDevices: () => `array_append(subscribed_devices, '${deviceId}')`
        });
    }
} 