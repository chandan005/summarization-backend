export async function ApiResponse(statusCode: number, message: any) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message),
  };
}
