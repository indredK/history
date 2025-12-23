import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma, PrismaClientType } from './prisma.extension';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client: PrismaClientType;

  constructor() {
    this.client = prisma;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // Delegate all Prisma methods to the client
  get dynasty() {
    return this.client.dynasty;
  }

  get emperor() {
    return this.client.emperor;
  }

  get scholar() {
    return this.client.scholar;
  }

  get philosophicalSchool() {
    return this.client.philosophicalSchool;
  }

  get tangFigure() {
    return this.client.tangFigure;
  }

  get songFigure() {
    return this.client.songFigure;
  }

  get yuanFigure() {
    return this.client.yuanFigure;
  }

  get mingFigure() {
    return this.client.mingFigure;
  }

  get qingRuler() {
    return this.client.qingRuler;
  }

  get sanguoFigure() {
    return this.client.sanguoFigure;
  }

  get mythology() {
    return this.client.mythology;
  }

  get religionNode() {
    return this.client.religionNode;
  }

  get religionEdge() {
    return this.client.religionEdge;
  }

  get person() {
    return this.client.person;
  }

  get event() {
    return this.client.event;
  }

  get place() {
    return this.client.place;
  }

  get source() {
    return this.client.source;
  }

  get personSource() {
    return this.client.personSource;
  }

  get eventSource() {
    return this.client.eventSource;
  }

  get placeSource() {
    return this.client.placeSource;
  }

  get eventParticipant() {
    return this.client.eventParticipant;
  }

  get eventLocation() {
    return this.client.eventLocation;
  }
}