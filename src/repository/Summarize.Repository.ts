import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { ISummarize } from '../entities/ISummarize';

const dynamoDb = new DynamoDB.DocumentClient();
const TableName = process.env.SUMMARIZATION_TABLE_NAME;

export async function putItem(item: ISummarize): Promise<void> {
  if (!TableName) {
    return;
  }
  const params: DocumentClient.PutItemInput = {
    TableName: TableName,
    Item: item,
  };

  await dynamoDb.put(params).promise();
}

export async function getItem(id: string): Promise<ISummarize | null> {
  if (!TableName) {
    return null;
  }
  const params: DocumentClient.GetItemInput = {
    TableName: TableName,
    Key: {
      id: id,
    },
  };

  const result = (await dynamoDb.get(params).promise()).Item as ISummarize;
  return result;
}

export async function getItems(page: number): Promise<ISummarize[]> {
  if (!TableName) {
    return [];
  }
  const params: DocumentClient.ScanInput = {
    TableName: TableName,
    Limit: 25,
    ExclusiveStartKey: page > 1 ? { id: `page-${page - 1}` } : undefined,
  };

  const result = await dynamoDb.scan(params).promise();
  return (result.Items as ISummarize[]) || [];
}
