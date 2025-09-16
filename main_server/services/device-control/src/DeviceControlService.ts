import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, connect } from 'mqtt';
import { ConfigService } from '@nestjs/config';
import {
  DeviceCommand,
  DeviceStatus,
  DeviceCommandType,
  CommandStatus,
  DeviceError,
  DeviceOperationalStatus,
  CommandPriority,
} from '@shared/interfaces/device-control.interface';
import { DeviceEntity } from './entities/device.entity';

@Injectable()
export class DeviceControlService {
  private mqttClient: Client;
  private readonly topicPrefix = 'spider/habitat/device';

  constructor(
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
    private configService: ConfigService,
  ) {
    this.initializeMQTTClient();
  }

  private async initializeMQTTClient(): Promise<void> {
    const mqttConfig = {
      host: this.configService.get<string>('MQTT_HOST'),
      port: this.configService.get<number>('MQTT_PORT'),
      username: this.configService.get<string>('MQTT_USERNAME'),
      password: this.configService.get<string>('MQTT_PASSWORD'),
    };

    this.mqttClient = connect(`mqtt://${mqttConfig.host}:${mqttConfig.port}`, {
      username: mqttConfig.username,
      password: mqttConfig.password,
      clientId: `device-control-service-${Date.now()}`,
    });

    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.mqttClient.on('message', (topic: string, message: Buffer) => {
      this.handleMQTTMessage(topic, message);
    });

    this.mqttClient.on('error', (error: Error) => {
      console.error('MQTT Client Error:', error);
    });
  }

  private subscribeToTopics(): void {
    const topics = [
      `${this.topicPrefix}/+/status`,
      `${this.topicPrefix}/+/error`,
      `${this.topicPrefix}/+/telemetry`,
    ];

    topics.forEach((topic) => {
      this.mqttClient.subscribe(topic, (err: Error | null) => {
        if (err) {
          console.error(`Error subscribing to ${topic}:`, err);
        }
      });
    });
  }

  private async handleMQTTMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const payload = JSON.parse(message.toString());
      const [, , deviceId, messageType] = topic.split('/');

      switch (messageType) {
        case 'status':
          await this.updateDeviceStatus(deviceId, payload);
          break;
        case 'error':
          await this.handleDeviceError(deviceId, payload);
          break;
        case 'telemetry':
          await this.processTelemetry(deviceId, payload);
          break;
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  }

  async sendCommand(command: DeviceCommand): Promise<boolean> {
    try {
      const topic = `${this.topicPrefix}/${command.id}/command`;
      const message = JSON.stringify(command);

      return new Promise((resolve) => {
        this.mqttClient.publish(topic, message, { qos: 1 }, (err: Error | null) => {
          if (err) {
            console.error('Error sending command:', err);
            resolve(false);
          }
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Error in sendCommand:', error);
      return false;
    }
  }

  async getDeviceStatus(deviceId: string): Promise<DeviceEntity | null> {
    try {
      return await this.deviceRepository.findOne({ where: { id: deviceId } });
    } catch (error) {
      console.error('Error getting device status:', error);
      return null;
    }
  }

  private async updateDeviceStatus(deviceId: string, status: Partial<DeviceStatus>): Promise<void> {
    try {
      await this.deviceRepository.update(deviceId, {
        ...status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating device status:', error);
    }
  }

  private async handleDeviceError(deviceId: string, error: DeviceError): Promise<void> {
    try {
      await this.updateDeviceStatus(deviceId, {
        status: DeviceOperationalStatus.ERROR,
        errors: [error],
      });

      // Implement error notification logic here
    } catch (err) {
      console.error('Error handling device error:', err);
    }
  }

  private async processTelemetry(deviceId: string, telemetry: unknown): Promise<void> {
    try {
      // Process and store telemetry data
      // Implement telemetry processing logic here
    } catch (error) {
      console.error('Error processing telemetry:', error);
    }
  }

  async setTemperature(deviceId: string, temperature: number): Promise<boolean> {
    const command: DeviceCommand = {
      id: `temp-${Date.now()}`,
      type: DeviceCommandType.SET_TEMPERATURE,
      parameters: { targetValue: temperature },
      priority: CommandPriority.NORMAL,
      timestamp: new Date(),
      status: CommandStatus.PENDING,
    };

    return this.sendCommand(command);
  }

  async setHumidity(deviceId: string, humidity: number): Promise<boolean> {
    const command: DeviceCommand = {
      id: `hum-${Date.now()}`,
      type: DeviceCommandType.SET_HUMIDITY,
      parameters: { targetValue: humidity },
      priority: CommandPriority.NORMAL,
      timestamp: new Date(),
      status: CommandStatus.PENDING,
    };

    return this.sendCommand(command);
  }

  async emergencyShutdown(deviceId: string): Promise<boolean> {
    const command: DeviceCommand = {
      id: `emergency-${Date.now()}`,
      type: DeviceCommandType.EMERGENCY_SHUTDOWN,
      parameters: {},
      priority: CommandPriority.EMERGENCY,
      timestamp: new Date(),
      status: CommandStatus.PENDING,
    };

    return this.sendCommand(command);
  }
} 