import { TranscribeService } from 'aws-sdk';
import { StartTranscriptionJobRequest } from 'aws-sdk/clients/transcribeservice';
import fetch from 'node-fetch';

const BUCKET_NAME = process.env.S3_BUCKET;

const transcribeService = new TranscribeService({ region: process.env.AWS_REGION });

async function startTranscriptionJob(s3InputFileName: string, jobName: string): Promise<void> {
  const params: StartTranscriptionJobRequest = {
    TranscriptionJobName: jobName,
    LanguageCode: 'en-US',
    MediaFormat: 'wav',
    Media: {
      MediaFileUri: `s3://${BUCKET_NAME}/${s3InputFileName}`,
    },
    OutputBucketName: `s3://${BUCKET_NAME}/transcriptions/${s3InputFileName}`,
  };

  await transcribeService.startTranscriptionJob(params).promise();
}

async function waitForTranscriptionJobCompletion(jobName: string): Promise<void> {
  while (true) {
    const status = await transcribeService
      .getTranscriptionJob({ TranscriptionJobName: jobName })
      .promise();

    if (
      status?.TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED' ||
      status?.TranscriptionJob?.TranscriptionJobStatus === 'FAILED'
    ) {
      break;
    }

    console.log('Not ready yet...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function fetchAndDisplayTranscript(jobName: string, s3InputFileName: string): Promise<void> {
  const status = await transcribeService
    .getTranscriptionJob({ TranscriptionJobName: jobName })
    .promise();

  if (status?.TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') {
    const transcriptUrl = status?.TranscriptionJob?.Transcript?.TranscriptFileUri;
    if (!transcriptUrl) {
      return;
    }
    const response = await fetch(transcriptUrl);
    const transcriptJson: any = await response.json();
    if (!transcriptJson) {
      return;
    }

    const transcriptText = transcriptJson?.results?.transcripts[0].transcript;
    console.log(transcriptText);
  } else {
    console.log('Transcription job failed');
  }
}

async function startAndWaitForTranscription(s3InputFileName: string): Promise<void> {
  try {
    const jobName = `${s3InputFileName}-${Date.now()}`;
    await startTranscriptionJob(s3InputFileName, jobName);

    await waitForTranscriptionJobCompletion(jobName);

    await fetchAndDisplayTranscript(jobName, s3InputFileName);
  } catch (error) {
    console.error('Error:', error);
  }
}
