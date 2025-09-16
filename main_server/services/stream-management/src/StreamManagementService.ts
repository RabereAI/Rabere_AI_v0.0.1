import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StreamManagementService {
    private readonly streamConfig: StreamConfig;

    constructor(
        private readonly configService: ConfigService,
        private readonly streamRepository: StreamRepository,
        private readonly notificationService: NotificationService
    ) {
        this.streamConfig = {
            resolution: '1080p',
            frameRate: 30,
            codec: 'h264',
            streamKey: this.configService.get<string>('STREAM_KEY')
        };
    }

    async startStream(deviceId: string): Promise<StreamSession> {
        const session = await this.streamRepository.createSession({
            deviceId,
            startTime: new Date(),
            config: this.streamConfig,
            status: 'INITIALIZING'
        });

        await this.notificationService.notify({
            type: 'STREAM_STARTED',
            deviceId,
            sessionId: session.id
        });

        return session;
    }

    async stopStream(sessionId: string): Promise<void> {
        await this.streamRepository.updateSession(sessionId, { status: 'STOPPED' });
    }
} 