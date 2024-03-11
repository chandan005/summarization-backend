import { S3 } from 'aws-sdk';
import Joi from 'joi';
import { GetPresignedUrlDto } from '../dto/GetPresignedUrlDto';
import { PresignedUrlType } from '../dto/PresignedUrlType';
import { SignedUrlResponseDto } from '../dto/SignedUrlResponseDto';

const s3 = new S3({
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

async function generateSignedUrl(
  key: string,
  operationType: PresignedUrlType,
  expirationTimeInSeconds?: number | undefined,
): Promise<string> {
  try {
    return s3.getSignedUrlPromise(operationType, {
      Key: key,
      Bucket: process.env.S3_BUCKET,
      Expires: expirationTimeInSeconds,
    });
  } catch (err: any) {
    throw new Error(err);
  }
}

export async function uploadToS3(payload: any): Promise<SignedUrlResponseDto> {
  const schema = Joi.object<GetPresignedUrlDto>({
    operationType: Joi.string()
      .valid(PresignedUrlType.GetObject, PresignedUrlType.PutObject)
      .required(),
    fileName: Joi.string().required(),
    expirationTimeInSeconds: Joi.number().optional(),
  });

  const { error: validationError } = schema.validate(payload);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const { operationType, fileName, expirationTimeInSeconds } = payload as GetPresignedUrlDto;

  try {
    const signedUrl = await generateSignedUrl(fileName, operationType, expirationTimeInSeconds);
    if (!signedUrl) {
      throw new Error('Error getting signedUrl.');
    }
    const response: SignedUrlResponseDto = {
      signedUrl,
      operationType,
      expirationTimeInSeconds,
    };
    return response;
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}
