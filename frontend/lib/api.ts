import {
  type JobFile,
  type JobPayload,
  type JobsFeed,
  type JobStatus,
  type JobSummary,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY = "media-user-id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ApiJob = {
  id: string;
  url: string;
  mode: "video" | "audio";
  type: "single" | "playlist";
  status: string;
  created_at: string;
  files?: Array<{
    id: string;
    file_url: string;
    file_type: string;
    created_at: string;
  }>;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function getProgress(status: JobStatus) {
  if (status === "pending") return 18;
  if (status === "processing") return 68;
  if (status === "done") return 100;
  return 100;
}

function normalizeStatus(status: string): JobStatus {
  if (status === "pending" || status === "processing" || status === "done") {
    return status;
  }

  return "error";
}

function getSourceName(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "media source";
  }
}

function buildLogs(status: JobStatus, type: JobSummary["type"]) {
  if (status === "done") {
    return [
      "Request validated",
      type === "playlist" ? "Playlist items normalized" : "Single asset extracted",
      "Worker upload finished",
    ];
  }

  if (status === "processing") {
    return [
      "Queued in Redis",
      "Worker reserving bandwidth",
      "FFmpeg pipeline active",
    ];
  }

  if (status === "pending") {
    return [
      "Request accepted",
      "Awaiting worker slot",
      "Storage target prepared",
    ];
  }

  return [
    "Request accepted",
    "Worker failed to complete",
    "Retry required",
  ];
}

function mapFiles(files: ApiJob["files"], mode: ApiJob["mode"]): JobFile[] {
  return (files ?? []).map((file, index) => ({
    id: file.id,
    fileUrl: file.file_url,
    fileType: file.file_type,
    label: `${mode === "audio" ? "Audio" : "Media"} ${index + 1}`,
    size: mode === "audio" ? "192 kbps" : "Best available",
  }));
}

function mapApiJob(job: ApiJob): JobSummary {
  const status = normalizeStatus(job.status);
  const files = mapFiles(job.files, job.mode);

  return {
    id: job.id,
    url: job.url,
    sourceName: getSourceName(job.url),
    mode: job.mode,
    type: job.type,
    status,
    createdAt: job.created_at,
    progress: getProgress(status),
    itemsLabel: job.type === "playlist" ? "Playlist batch" : "Single asset",
    durationLabel:
      status === "done"
        ? "Ready for download"
        : status === "processing"
          ? "Worker in progress"
          : status === "pending"
            ? "Waiting in queue"
            : "Needs attention",
    files,
    logs: buildLogs(status, job.type),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  headers.set("X-User-Id", getUserId());

  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const rawBody = await response.text();

    try {
      const payload = JSON.parse(rawBody) as { detail?: string };
      throw new Error(payload.detail ?? `API request failed with status ${response.status}`);
    } catch {
      throw new Error(rawBody || `API request failed with status ${response.status}`);
    }
  }

  return response.json() as Promise<T>;
}

export async function listJobs(): Promise<JobsFeed> {
  try {
    const jobs = await request<ApiJob[]>("/jobs");

    return {
      source: "api",
      note: "API conectada. Atualizando em tempo real.",
      jobs: jobs.map(mapApiJob),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "API request failed";
    throw new Error(`Erro ao consultar a API: ${message}`);
  }
}

export async function createJob(payload: JobPayload) {
  try {
    const job = await request<ApiJob>("/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      source: "api" as const,
      note: "Processamento iniciado no servidor.",
      job: mapApiJob(job),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "API request failed";
    throw new Error(`Falha ao comunicar com o servidor: ${message}`);
  }
}

export function getUserId() {
  if (typeof window === "undefined") {
    return "00000000-0000-0000-0000-000000000000";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && isUuid(stored)) return stored;

  const generated = createId();
  window.localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}

export function isPreviewOnly() {
  return false;
}
