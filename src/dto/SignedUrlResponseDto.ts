import { PresignedUrlType } from './PresignedUrlType';

export interface SignedUrlResponseDto {
  signedUrl: string;
  operationType: PresignedUrlType;
  expirationTimeInSeconds?: number;
}
