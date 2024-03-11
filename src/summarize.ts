import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { CreateSummarizationDto } from './dto/CreateSummarizationDto';
import { ISummarize } from './entities/ISummarize';
import { getItem, putItem } from './repository/Summarize.Repository';

export async function createSummarization(payload: any): Promise<ISummarize> {
  const schema = Joi.object<CreateSummarizationDto>({
    s3FileName: Joi.string().required(),
  });

  const { error: validationError } = schema.validate(payload);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const { s3FileName } = payload as CreateSummarizationDto;

  try {
    const id = uuidv4();
    await putItem({ id: uuidv4(), s3FileName, s3Url: '', createdAt: new Date().toISOString() });
    const summarizedItem = await getItem(id);
    if (!summarizedItem) {
      throw new Error('Item not found');
    }
    return summarizedItem;
  } catch (err: any) {
    throw new Error(`${err.message}`);
  }
}

export async function findSummarizations(query: any): Promise<ISummarize[]> {
  return [];
}
