import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createSummarization, findSummarizations } from './services/LambdaApi';
import { uploadToS3 } from './services/S3';
import { ApiMethod } from './shared/ApiMethod.Enum';
import { ApiPath } from './shared/ApiPath.Enum';
import { ApiResponse } from './shared/ApiResponse';

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

async function handler(event: any, context?: Context): Promise<APIGatewayProxyResult> {
  console.log('Event Body', event.body);
  console.log('Event Path', event);

  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  switch (path) {
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

    case ApiPath.Summarize:
      if (method === ApiMethod.Get) {
        const query = event.queryStringParameters;
        if (!query.count) {
          return ApiResponse(400, { message: 'Count Missing in Query' });
        }
        const summarizations = await findSummarizations({
          count: parseInt(query.count),
          nextPageKey: query.nextPageKey,
        });
        return ApiResponse(200, { ...summarizations });
      }
      if (method === ApiMethod.Post) {
        let payload: any;
        try {
          payload = checkIfBodyIsValid(event);
          const summarizedItem = await createSummarization(payload);
          return ApiResponse(200, {});
        } catch (err: any) {
          return ApiResponse(400, { message: err.message });
        }
      }
      return ApiResponse(404, { message: 'Summarization Not Found' });

    default:
      return ApiResponse(400, { message: 'Path Not Allowed' });
  }
}

exports.handler = handler;
