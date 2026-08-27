import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const CIRCULAR_SCOPES = ['school', 'section'] as const;

export class CreateCircularDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsIn(CIRCULAR_SCOPES)
  scope!: (typeof CIRCULAR_SCOPES)[number];

  @ValidateIf((o: CreateCircularDto) => o.scope === 'section')
  @IsString()
  @MinLength(1)
  sectionId?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileIds?: string[];
}
