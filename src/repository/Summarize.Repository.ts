import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { SummarizationResponseDto } from '../dto/SummarizationResponseDto';
import { ISummarize } from '../entities/ISummarize';

const dynamoDb = new DynamoDB.DocumentClient();
const TableName = process.env.SUMMARIZATION_TABLE_NAME;

export async function putItem(item: ISummarize): Promise<void> {
  if (!TableName) {
    throw new Error('Invalid Table');
  }
  const params: DocumentClient.PutItemInput = {
    TableName: TableName,
    Item: item,
  };

  try {
    await dynamoDb.put(params).promise();
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}

export async function getItem(id: string): Promise<ISummarize | undefined> {
  if (!TableName) {
    throw new Error('Invalid Table');
  }
  const params: DocumentClient.GetItemInput = {
    TableName: TableName,
    Key: {
      id: id,
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    console.log('DynamoDB Get Item', result.Item);

    return result.Item as ISummarize | undefined;
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}

export async function getItems(
  count: number,
  nextPageKey?: string,
): Promise<SummarizationResponseDto | undefined> {
  if (!TableName) {
    throw new Error('Invalid Table');
  }
  const params: any = {
    TableName: TableName,
    KeyConditionExpression: '#createdAt >= :createdAt',
    ExpressionAttributeNames: {
      '#createdAt': 'createdAt',
    },
    ExpressionAttributeValues: {
      ':createdAt': '0',
    },
    Limit: count,
  };

  if (nextPageKey) {
    params.ExclusiveStartKey = JSON.parse(nextPageKey);
  }

  try {
    const result = await dynamoDb.query(params).promise();
    if (!result) {
      throw new Error('Error getting items.');
    }
    const summarizations: ISummarize[] = result.Items ? (result.Items as ISummarize[]) : [];

    return {
      data: summarizations,
      pagination: {
        count: result.Count ?? 0,
        nextPageKey: JSON.stringify(result.LastEvaluatedKey),
      },
    };
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}
