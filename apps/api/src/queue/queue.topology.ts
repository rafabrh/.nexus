import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel } from 'amqplib';

const EXCHANGES = {
  EVENTS: 'nexus.events',
  DLX: 'nexus.dlx',
} as const;

const QUEUES = {
  MESSAGES_UPSERT: 'nexus.messages.upsert',
  SEND_MESSAGE: 'nexus.send.message',
  CONNECTION_UPDATE: 'nexus.connection.update',
  CONTACTS_UPDATE: 'nexus.contacts.update',
  CONFIG_CHANGED: 'nexus.config.changed',
  DLQ: 'nexus.dlq',
} as const;

@Injectable()
export class QueueTopology implements OnModuleInit {
  constructor(private readonly channel: Channel) {}

  async onModuleInit() {
    await this.channel.assertExchange(EXCHANGES.EVENTS, 'topic', { durable: true });
    await this.channel.assertExchange(EXCHANGES.DLX, 'fanout', { durable: true });

    for (const queue of Object.values(QUEUES)) {
      const dlqArgs = queue !== QUEUES.DLQ
        ? { 'x-dead-letter-exchange': EXCHANGES.DLX, 'x-message-ttl': 30000 }
        : {};

      await this.channel.assertQueue(queue, { durable: true, arguments: dlqArgs });
    }

    await this.channel.bindQueue(QUEUES.MESSAGES_UPSERT, EXCHANGES.EVENTS, 'messages.upsert');
    await this.channel.bindQueue(QUEUES.SEND_MESSAGE, EXCHANGES.EVENTS, 'send.message');
    await this.channel.bindQueue(QUEUES.CONNECTION_UPDATE, EXCHANGES.EVENTS, 'connection.update');
    await this.channel.bindQueue(QUEUES.DLQ, EXCHANGES.DLX, '');
  }
}
