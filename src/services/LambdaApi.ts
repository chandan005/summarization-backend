import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { CreateSummarizationDto } from '../dto/CreateSummarizationDto';
import { FindSummarizationQueryDto } from '../dto/FindSummarizationQueryDto';
import { SummarizationResponseDto } from '../dto/SummarizationResponseDto';
import { ISummarize } from '../entities/ISummarize';
import { getItem, getItems, putItem } from '../repository/Summarize.Repository';
import { fetchS3ObjectContent } from './S3';
import { summarizeText } from './Summarize';
import { startAndWaitForTranscription } from './transcribe';

export async function createSummarization(payload: any): Promise<ISummarize> {
  const schema = Joi.object<CreateSummarizationDto>({
    s3InputFileName: Joi.string().required(),
    isText: Joi.boolean().optional(),
    isMedia: Joi.boolean().optional(),
  });

  const { error: validationError } = schema.validate(payload);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const { s3InputFileName, isText, isMedia } = payload as CreateSummarizationDto;

  if (isText) {
    const s3TextContent = await fetchS3ObjectContent(s3InputFileName);
    const summarizedText = await summarizeText(s3TextContent);
  }

  if (isMedia) {
    const transcibedText = await startAndWaitForTranscription(s3InputFileName);
  }

  try {
    const id = uuidv4();
    await putItem({
      id: uuidv4(),
      s3InputFileName,
      createdAt: new Date().toISOString(),
    });
    const summarizedItem = await getItem(id);
    if (!summarizedItem) {
      throw new Error('Item not found');
    }
    return summarizedItem;
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}

export async function findSummarizations(
  query: any,
): Promise<SummarizationResponseDto | undefined> {
  const schema = Joi.object<FindSummarizationQueryDto>({
    count: Joi.number().required(),
    nextPageKey: Joi.string().optional(),
  });

  const { error: validationError } = schema.validate(query);
  if (validationError) {
    throw new Error(validationError.message);
  }

  try {
    const { count = 25, nextPageKey } = query as FindSummarizationQueryDto;
    return getItems(count, nextPageKey);
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}
