export interface ISummarize {
  id: string;
  s3InputFileName: string;
  s3InputFileUrl: string;
  isText?: boolean;
  isMedia?: boolean;
  s3TranscribedFileName?: string;
  s3TranscribedFileUrl?: string;
  summarizedText?: string;
  createdAt: string;
}
