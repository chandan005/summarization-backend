export interface ISummarize {
  id: string;
  s3FileName: string;
  s3Url: string;
  isText?: boolean;
  isMedia?: boolean;
  transcribedText?: string;
  summarizedText?: string;
  createdAt: string;
}
