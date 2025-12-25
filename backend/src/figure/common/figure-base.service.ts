import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FigureBaseService {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * 统一转换人物数据，处理 JSON 字段
   */
  protected transformFigure<T>(figure: any): T {
    if (!figure) return {} as T;

    return {
      ...figure,
      achievements: this.parseJson(figure.achievements),
      positions: this.parseJson(figure.positions),
      events: this.parseJson(figure.events),
      evaluations: this.parseJson(figure.evaluations),
      sources: this.parseJson(figure.sources),
      works: this.parseJson(figure.works),
      battles: this.parseJson(figure.battles),
      policies: this.parseJson(figure.policies),
      majorEvents: this.parseJson(figure.majorEvents),
    };
  }

  protected parseJson(value: any): any {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  }
}
