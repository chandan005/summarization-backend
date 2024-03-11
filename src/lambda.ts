import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ApiMethod } from './shared/ApiMethod.Enum';
import { ApiPath } from './shared/ApiPath.Enum';
import { ApiResponse } from './shared/ApiResponse';
import { UploadHandler } from './upload';

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
      return UploadHandler(event, context);
    case ApiPath.FindSummarization:
      if (method !== ApiMethod.Get) {
        return ApiResponse(405, { message: 'Method Not Allowed' });
      }
      return ApiResponse(200, {});
    default:
      return ApiResponse(404, { message: 'Not Found' });
  }
}

exports.handler = handler;
