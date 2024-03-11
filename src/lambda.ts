import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ApiMethod } from './shared/ApiMethod.Enum';
import { ApiPath } from './shared/ApiPath.Enum';
import { ApiResponse } from './shared/ApiResponse';
import { createSummarization } from './summarize';
import { uploadToS3 } from './upload';

function checkIfBodyIsValid(event: APIGatewayEvent): any | undefined {
  if (!event.body) {
    throw new Error('Missing body');
  }

  try {
    const body = JSON.parse(event.body);
    return body;
  } catch (error) {
    throw new Error('Invalid JSON format in body');
  }
}

async function handler(event: APIGatewayEvent, context?: Context): Promise<APIGatewayProxyResult> {
  if (!event.requestContext) {
    return ApiResponse(400, { message: 'Bad Request - Missing Path' });
  }

  const path = event.path;
  const method = event.httpMethod;

  switch (event.path) {
    case ApiPath.UploadObject:
      if (method !== ApiMethod.Post) {
        return ApiResponse(405, { message: 'Method Not Allowed' });
      }
      let payload: any;
      try {
        payload = checkIfBodyIsValid(event);
        const signedUrlResponse = uploadToS3(payload);
        return ApiResponse(200, { ...signedUrlResponse });
      } catch (err: any) {
        return ApiResponse(400, { message: err.message });
      }

    case ApiPath.FindSummarization:
      if (method === ApiMethod.Get) {
        return ApiResponse(200, {});
      }
      if (method === ApiMethod.Post) {
        let payload: any;
        try {
          payload = checkIfBodyIsValid(event);
          const summarizedItem = await createSummarization(payload);
          return ApiResponse(200, { ...summarizedItem });
        } catch (err: any) {
          return ApiResponse(400, { message: err.message });
        }
      }
      return ApiResponse(404, { message: 'Not Found' });

    default:
      return ApiResponse(404, { message: 'Not Found' });
  }
}

exports.handler = handler;
