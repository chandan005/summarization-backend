export interface ISummarize {
  id: string;
  s3InputFileName: string;
  isText?: boolean;
  isMedia?: boolean;
  transcribedText?: string;
  summarizedText?: string;
  createdAt: string;
}
