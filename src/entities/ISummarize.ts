export interface ISummarize {
  id: string;
  s3InputFileName: string;
  isText?: boolean;
  isMedia?: boolean;
  s3TranscribedFileName?: string;
  summarizedText?: string;
  createdAt: string;
}
