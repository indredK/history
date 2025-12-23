import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonQueryDto } from './dto/person-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PersonDto } from './dto/person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PersonQueryDto): Promise<PaginatedResponseDto<PersonDto>> {
    const { page = 1, limit = 20, birthYear, deathYear, name, dynasty } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (birthYear !== undefined) {
      where.birthYear = { gte: birthYear };
    }
    
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null }, // Include persons with unknown death year
      ];
    }
    
    if (name) {
      where.name = { contains: name };
    }

    // Note: Dynasty filtering would require additional logic to match persons to dynasties
    // This is a simplified implementation - in a real scenario, you might need to join
    // with events or other tables to determine dynasty associations
    
    // Execute queries
    const [persons, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { birthYear: 'asc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.person.count({ where }),
    ]);

    return new PaginatedResponseDto(persons, total, page, limit);
  }

  async findOne(id: string): Promise<PersonDto> {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    // Return the person without the events for now (can be extended later)
    const { events, ...personData } = person;
    return personData;
  }
}