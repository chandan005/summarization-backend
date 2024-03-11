import {
  AccessDeniedException,
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const BedRockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

async function summarizeText(prompt: string): Promise<void> {
  const textGenerationConfig = {
    maxTokenCount: 4096,
    stopSequences: [],
    temperature: 0,
    topP: 1,
  };
  const payload = {
    inputText: prompt,
    textGenerationConfig,
  };

  const command = new InvokeModelCommand({
    body: JSON.stringify(payload),
    contentType: 'application/json',
    accept: 'application/json',
    modelId: 'amazon.titan-text-express-v1',
  });
  try {
    const response = await BedRockClient.send(command);
    const decodedResponseBody = new TextDecoder().decode(response.body);

    const responseBody = JSON.parse(decodedResponseBody);
    console.log(responseBody.results);
    // return responseBody.results;
  } catch (err) {
    if (err instanceof AccessDeniedException) {
      console.error(`Access denied. Ensure you have the correct permissions to invoke.`);
    } else {
      throw err;
    }
  }
}
