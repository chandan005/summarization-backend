import { ISummarize } from '../entities/ISummarize';

export interface IPagination {
  count: number;
  nextPageKey?: string;
}

export interface SummarizationResponseDto {
  data: ISummarize[];
  pagination: IPagination;
}
