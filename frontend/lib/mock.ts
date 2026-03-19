import type { JobPayload, JobSummary, JobType } from "./types";

const PREVIEW_STORAGE_KEY = "media-preview-jobs";

type StoredPreviewJob = {
  id: string;
  url: string;
  mode: JobPayload["mode"];
  type: JobPayload["type"];
  createdAt: string;
};

const seededJobs: JobSummary[] = [
  {
    id: "seed-1",
    url: "https://www.youtube.com/watch?v=stream-alpha",
    sourceName: "youtube.com",
    mode: "video",
    type: "single",
    status: "done",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    progress: 100,
    itemsLabel: "Single asset",
    durationLabel: "Merged in MP4",
    files: [
      {
        id: "seed-1-file-1",
        fileUrl: buildDataUrl("preview-video.mp4"),
        fileType: "mp4",
        label: "Master MP4",
        size: "142 MB",
      },
    ],
    logs: ["URL parsed", "Best video/audio selected", "Upload finished"],
  },
  {
    id: "seed-2",
    url: "https://www.youtube.com/playlist?list=synth-wave",
    sourceName: "youtube.com",
    mode: "audio",
    type: "playlist",
    status: "processing",
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    progress: 72,
    itemsLabel: "Playlist batch",
    durationLabel: "Extracting MP3 sequence",
    files: [],
    logs: ["Playlist indexed", "Audio normalization running", "Storage upload pending"],
  },
  {
    id: "seed-3",
    url: "https://www.youtube.com/watch?v=queue-beta",
    sourceName: "youtube.com",
    mode: "audio",
    type: "single",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    progress: 24,
    itemsLabel: "Single asset",
    durationLabel: "Awaiting worker slot",
    files: [],
    logs: ["Request accepted", "Queued in Redis", "Waiting for worker"],
  },
];

function buildDataUrl(filename: string) {
  const content = `Preview asset generated for ${filename}.`;
  return `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `preview-${Math.random().toString(36).slice(2, 10)}`;
}

function getSourceName(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "media source";
  }
}

function readStoredJobs(): StoredPreviewJob[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredJobs(jobs: StoredPreviewJob[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(jobs.slice(0, 12)));
}

function getPreviewFiles(jobId: string, mode: JobPayload["mode"], type: JobType) {
  const fileType = mode === "audio" ? "mp3" : "mp4";

  if (type === "playlist") {
    return [
      {
        id: `${jobId}-file-1`,
        fileUrl: buildDataUrl(`${jobId}-pack.${fileType}`),
        fileType,
        label: "Pack 01",
        size: mode === "audio" ? "11 tracks" : "4 items",
      },
      {
        id: `${jobId}-file-2`,
        fileUrl: buildDataUrl(`${jobId}-manifest.txt`),
        fileType: "txt",
        label: "Manifest",
        size: "Metadata",
      },
    ];
  }

  return [
    {
      id: `${jobId}-file-1`,
      fileUrl: buildDataUrl(`${jobId}.${fileType}`),
      fileType,
      label: mode === "audio" ? "Preview MP3" : "Preview MP4",
      size: mode === "audio" ? "192 kbps" : "Best quality",
    },
  ];
}

function materializeJob(job: StoredPreviewJob): JobSummary {
  const ageMs = Date.now() - new Date(job.createdAt).getTime();
  const host = getSourceName(job.url);

  if (ageMs < 20_000) {
    return {
      id: job.id,
      url: job.url,
      sourceName: host,
      mode: job.mode,
      type: job.type,
      status: "pending",
      createdAt: job.createdAt,
      progress: 18,
      itemsLabel: job.type === "playlist" ? "Playlist batch" : "Single asset",
      durationLabel: "Waiting in queue",
      files: [],
      logs: ["Request accepted", "Quota checked", "Worker slot pending"],
    };
  }

  if (ageMs < 75_000) {
    return {
      id: job.id,
      url: job.url,
      sourceName: host,
      mode: job.mode,
      type: job.type,
      status: "processing",
      createdAt: job.createdAt,
      progress: 66,
      itemsLabel: job.type === "playlist" ? "Playlist batch" : "Single asset",
      durationLabel: "Worker downloading media",
      files: [],
      logs: ["URL normalized", "yt-dlp running", "FFmpeg post-processing"],
    };
  }

  return {
    id: job.id,
    url: job.url,
    sourceName: host,
    mode: job.mode,
    type: job.type,
    status: "done",
    createdAt: job.createdAt,
    progress: 100,
    itemsLabel: job.type === "playlist" ? "Playlist batch" : "Single asset",
    durationLabel: job.mode === "audio" ? "MP3 package ready" : "MP4 package ready",
    files: getPreviewFiles(job.id, job.mode, job.type),
    logs: ["Download complete", "Upload complete", "Ready for delivery"],
  };
}

export function getPreviewJobs() {
  const stored = readStoredJobs().map(materializeJob);
  return [...stored, ...seededJobs].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function createPreviewJob(payload: JobPayload) {
  const createdJob: StoredPreviewJob = {
    id: createId(),
    url: payload.url,
    mode: payload.mode,
    type: payload.type,
    createdAt: new Date().toISOString(),
  };

  writeStoredJobs([createdJob, ...readStoredJobs()]);
  return materializeJob(createdJob);
}
