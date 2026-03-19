export type JobStatus = "pending" | "processing" | "done" | "error";
export type JobMode = "video" | "audio";
export type JobType = "single" | "playlist";
export type FeedSource = "api" | "mock";

export type JobFile = {
  id: string;
  fileUrl: string;
  fileType: string;
  label: string;
  size: string;
};

export type JobSummary = {
  id: string;
  url: string;
  sourceName: string;
  mode: JobMode;
  type: JobType;
  status: JobStatus;
  createdAt: string;
  progress: number;
  itemsLabel: string;
  durationLabel: string;
  files: JobFile[];
  logs: string[];
};

export type JobPayload = {
  url: string;
  mode: JobMode;
  type: JobType;
};

export type JobsFeed = {
  jobs: JobSummary[];
  source: FeedSource;
  note: string;
};
