import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

function parseNumberRange(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const rawValues = Array.isArray(value) ? value : String(value).split(',');
  return rawValues.map((item) => {
    if (typeof item === 'number') {
      return item;
    }

    const normalized = String(item).trim();
    return normalized ? Number(normalized) : Number.NaN;
  });
}

class LocationDto {
  @ApiProperty({ description: 'Location type', example: 'Point' })
  type: 'Point';

  @ApiProperty({
    description: 'Coordinates [longitude, latitude]',
    example: [116.4074, 39.9042],
  })
  coordinates: [number, number];
}

export class PlaceDto {
  @ApiProperty({ description: 'Place ID', example: 'place_beijing_1' })
  id: string;

  @ApiProperty({ description: 'Canonical name', example: 'Beijing' })
  canonical_name: string;

  @ApiProperty({
    description: 'Alternative names',
    example: ['Peking', '北京'],
    required: false,
  })
  alt_names?: string[];

  @ApiPropertyOptional({
    description: 'Place description',
    example: 'Capital city of China',
  })
  description?: string;

  @ApiPropertyOptional({ description: 'Geographical location' })
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiProperty({
    description: 'Source IDs',
    example: ['src_123'],
    required: false,
  })
  source_ids?: string[];
}

export class PlaceQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword',
    example: '长安',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Longitude range',
    example: [116, 117],
    type: [Number],
  })
  @IsOptional()
  @Transform(({ value }) => parseNumberRange(value))
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  lon_range?: number[];

  @ApiPropertyOptional({
    description: 'Latitude range',
    example: [39, 40],
    type: [Number],
  })
  @IsOptional()
  @Transform(({ value }) => parseNumberRange(value))
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  lat_range?: number[];
}
