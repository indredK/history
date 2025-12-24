import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScholarQueryDto } from './dto/scholar-query.dto';
import { SchoolQueryDto } from './dto/school-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { ScholarDto } from './dto/scholar.dto';
import { PhilosophicalSchoolDto } from './dto/philosophical-school.dto';

@Injectable()
export class CultureService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllScholars(query: ScholarQueryDto): Promise<PaginatedResponseDto<ScholarDto>> {
    const { 
      page = 1, 
      limit = 20, 
      dynastyPeriod, 
      philosophicalSchoolId, 
      schoolName, 
      name, 
      birthYear, 
      deathYear 
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (dynastyPeriod) {
      where.dynastyPeriod = { contains: dynastyPeriod };
    }
    
    if (philosophicalSchoolId) {
      where.philosophicalSchoolId = philosophicalSchoolId;
    }
    
    if (schoolName) {
      where.philosophicalSchool = {
        name: { contains: schoolName },
      };
    }
    
    if (name) {
      where.name = { contains: name };
    }
    
    if (birthYear !== undefined) {
      where.birthYear = { gte: birthYear };
    }
    
    if (deathYear !== undefined) {
      where.OR = [
        { deathYear: { lte: deathYear } },
        { deathYear: null },
      ];
    }

    // Execute queries
    const [scholars, total] = await Promise.all([
      this.prisma.scholar.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { birthYear: 'asc' },
          { name: 'asc' },
        ],
        include: {
          philosophicalSchool: true,
        },
      }),
      this.prisma.scholar.count({ where }),
    ]);

    // Transform the data to match DTO structure
    const transformedScholars = scholars.map(scholar => {
      const { philosophicalSchool, ...scholarData } = scholar;
      return {
        ...scholarData,
        // Parse JSON fields safely
        majorWorks: this.safeJsonParse(scholarData.majorWorks),
        contributions: this.safeJsonParse(scholarData.contributions),
      };
    });

    return new PaginatedResponseDto(transformedScholars, total, page, limit);
  }

  async findScholarById(id: string): Promise<ScholarDto> {
    const scholar = await this.prisma.scholar.findUnique({
      where: { id },
      include: {
        philosophicalSchool: true,
      },
    });

    if (!scholar) {
      throw new NotFoundException(`Scholar with ID ${id} not found`);
    }

    // Transform the data to match DTO structure
    const { philosophicalSchool, ...scholarData } = scholar;
    return {
      ...scholarData,
      // Parse JSON fields safely
      majorWorks: this.safeJsonParse(scholarData.majorWorks),
      contributions: this.safeJsonParse(scholarData.contributions),
    };
  }

  async findAllSchools(query: SchoolQueryDto): Promise<PaginatedResponseDto<PhilosophicalSchoolDto>> {
    const { page = 1, limit = 20, name, founder, foundingYear } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (name) {
      where.name = { contains: name };
    }
    
    if (founder) {
      where.founder = { contains: founder };
    }
    
    if (foundingYear !== undefined) {
      where.foundingYear = { gte: foundingYear };
    }

    // Execute queries
    const [schools, total] = await Promise.all([
      this.prisma.philosophicalSchool.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { foundingYear: 'asc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.philosophicalSchool.count({ where }),
    ]);

    // Transform the data to match DTO structure
    const transformedSchools = schools.map(school => ({
      ...school,
      // Parse JSON fields safely
      coreBeliefs: this.safeJsonParse(school.coreBeliefs),
      keyTexts: this.safeJsonParse(school.keyTexts),
    }));

    return new PaginatedResponseDto(transformedSchools, total, page, limit);
  }

  async findSchoolById(id: string): Promise<PhilosophicalSchoolDto> {
    const school = await this.prisma.philosophicalSchool.findUnique({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException(`Philosophical school with ID ${id} not found`);
    }

    // Transform the data to match DTO structure
    return {
      ...school,
      // Parse JSON fields safely
      coreBeliefs: this.safeJsonParse(school.coreBeliefs),
      keyTexts: this.safeJsonParse(school.keyTexts),
    };
  }

  private safeJsonParse(value: any): any {
    if (!value) return null;
    if (typeof value === 'string' && value.trim() !== '') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  }
}