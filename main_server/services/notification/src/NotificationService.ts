import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SystemNotification, NotificationType } from '../../../shared/interfaces/notification.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
    @WebSocketServer()
    private server: Server;

    private readonly userConnections: Map<string, Set<string>> = new Map();

    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>
    ) {}

    async notify(notification: SystemNotification): Promise<void> {
        const subscribers = await this.getSubscribers(notification);
        
        subscribers.forEach(userId => {
            const connections = this.userConnections.get(userId);
            if (connections) {
                connections.forEach(connectionId => {
                    this.server.to(connectionId).emit('notification', notification);
                });
            }
        });

        await this.saveNotification(notification);
    }

    private async getSubscribers(notification: SystemNotification): Promise<string[]> {
        switch (notification.type) {
            case NotificationType.EMERGENCY:
                return this.getAdminUsers();
            case NotificationType.PARAMETER_ALERT:
                return this.getDeviceSubscribers(notification.deviceId);
            default:
                return [];
        }
    }

    private async getAdminUsers(): Promise<string[]> {
        // Реализация получения админов
        return [];
    }

    private async getDeviceSubscribers(deviceId: string): Promise<string[]> {
        // Реализация получения подписчиков
        return [];
    }

    private async saveNotification(notification: SystemNotification): Promise<void> {
        await this.notificationRepository.save(notification);
    }
} 