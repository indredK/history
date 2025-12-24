import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiProperty({ description: 'Location type', example: 'Point' })
  type: string;

  @ApiProperty({ description: 'Coordinates [longitude, latitude]', example: [116.4074, 39.9042] })
  coordinates: number[];
}

export class PlaceDto {
  @ApiProperty({ description: 'Place ID', example: 'place_beijing_1' })
  id: string;

  @ApiProperty({ description: 'Canonical name', example: 'Beijing' })
  canonical_name: string;

  @ApiProperty({ description: 'Alternative names', example: ['Peking', '北京'], required: false })
  alt_names?: string[];

  @ApiProperty({ description: 'Place description', example: 'Capital city of China' })
  description: string;

  @ApiProperty({ description: 'Geographical location' })
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Source IDs', example: ['src_123'], required: false })
  source_ids?: string[];
}

export class PlaceQueryDto {
  @ApiProperty({ description: 'Search keyword', example: 'Beijing', required: false })
  keyword?: string;

  @ApiProperty({ description: 'Longitude range', example: [116, 117], required: false })
  lon_range?: number[];

  @ApiProperty({ description: 'Latitude range', example: [39, 40], required: false })
  lat_range?: number[];
}
