import { PresignedUrlType } from './PresignedUrlType';

export interface GetPresignedUrlDto {
  operationType: PresignedUrlType;
  fileName: string;
  expirationTimeInSeconds?: number;
}
