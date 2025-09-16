import { Injectable } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@Injectable()
export class GatewayService {
    constructor(
        private readonly deviceControlService: DeviceControlService,
        private readonly streamService: StreamManagementService,
        private readonly authService: AuthService
    ) {}

    @SubscribeMessage('environment_command')
    async handleEnvironmentCommand(@MessageBody() data: any): Promise<void> {
        await this.authService.validateToken(data.token);
        await this.deviceControlService.sendCommand(data.command);
    }

    @SubscribeMessage('stream_control')
    async handleStreamControl(@MessageBody() data: any): Promise<void> {
        await this.authService.validateToken(data.token);
        await this.streamService.handleStreamCommand(data.command);
    }
} 