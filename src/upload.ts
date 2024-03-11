import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import Joi from 'joi';
import { ApiResponse } from './shared/ApiResponse';

export enum PresignedUrlType {
  GetObject = 'getObject',
  PutObject = 'putObject',
}

export interface GetPresignedUrlDto {
  operationType: PresignedUrlType;
  fileName: string;
  expirationTimeInSeconds?: number;
}

export interface SignedUrlResponseDto {
  signedUrl: string;
  operationType: PresignedUrlType;
  expirationTimeInSeconds?: number;
}

export async function generateSignedUrl(
  key: string,
  operationType: PresignedUrlType,
  expirationTimeInSeconds?: number | undefined,
): Promise<string> {
  try {
    const s3 = new S3({
      region: process.env.AWS_REGION,
      signatureVersion: 'v4',
    });
    return s3.getSignedUrlPromise(operationType, {
      Key: key,
      Bucket: process.env.S3_BUCKET,
      Expires: expirationTimeInSeconds,
    });
  } catch (err: any) {
    throw new Error(err);
  }
}

export async function UploadHandler(
  event: APIGatewayEvent,
  context?: Context,
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return ApiResponse(400, { message: 'Missing Body' });
  }

  let body: any;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return ApiResponse(400, { message: 'Invalid JSON format in body' });
  }

  const schema = Joi.object<GetPresignedUrlDto>({
    operationType: Joi.string()
      .valid(PresignedUrlType.GetObject, PresignedUrlType.PutObject)
      .required(),
    fileName: Joi.string().required(),
    expirationTimeInSeconds: Joi.number().optional(),
  });

  const { error: validationError } = schema.validate(body);
  if (validationError) {
    return ApiResponse(400, { message: validationError.message });
  }

  const { operationType, fileName, expirationTimeInSeconds } = body as GetPresignedUrlDto;

  try {
    const signedUrl = await generateSignedUrl(fileName, operationType, expirationTimeInSeconds);
    if (!signedUrl) {
      return ApiResponse(404, { message: 'Error getting signedUrl.' });
    }
    const response: SignedUrlResponseDto = {
      signedUrl,
      operationType,
      expirationTimeInSeconds,
    };
    return ApiResponse(200, { ...response });
  } catch (err: any) {
    return ApiResponse(404, { message: `${err.message}` });
  }
}
