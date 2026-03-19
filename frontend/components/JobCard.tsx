import { motion } from "framer-motion";
import clsx from "clsx";
import type { JobSummary } from "../lib/types";

type JobCardProps = {
  job: JobSummary;
};

const statusConfig: Record<
  JobSummary["status"],
  { label: string; color: string; dot: string }
> = {
  pending: {
    label: "Pendente",
    color: "text-slate-300",
    dot: "bg-slate-400",
  },
  processing: {
    label: "Processando",
    color: "text-cyan-200",
    dot: "bg-cyan-300",
  },
  done: {
    label: "Concluido",
    color: "text-emerald-200",
    dot: "bg-emerald-300",
  },
  error: {
    label: "Erro",
    color: "text-rose-200",
    dot: "bg-rose-300",
  },
};

function VideoGlyph({ mode }: { mode: JobSummary["mode"] }) {
  if (mode === "audio") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M9 18V7.5l10-2V16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <rect
        x="3"
        y="6"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m15 10 6-3v10l-6-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function JobCard({ job }: JobCardProps) {
  const status = statusConfig[job.status];

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-midnight/60 p-5 shadow-lg backdrop-blur-md transition-all hover:border-neon/30 hover:bg-midnight hover:shadow-[0_15px_30px_rgba(0,240,255,0.15)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-cyan-300/12 text-cyan-200">
          <VideoGlyph mode={job.mode} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                <span>{job.mode}</span>
                <span>•</span>
                <span>{job.type === "single" ? "Individual" : "Playlist"}</span>
                <span>•</span>
                <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-2 truncate text-[1.05rem] font-semibold text-white">
                {job.url}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {job.files.length > 0 ? (
                <a
                  href={job.files[0]?.fileUrl}
                  download
                  className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/8"
                >
                  Baixar
                </a>
              ) : null}

              <button
                type="button"
                className="rounded-[14px] border border-white/10 bg-white/5 p-3 text-slate-500 transition hover:text-white"
                aria-label="Acao do job"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M6 7h12M9 7V5h6v2m-8 0 1 12h8l1-12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <div className={clsx("flex items-center gap-2", status.color)}>
              <span className={clsx("h-2 w-2 rounded-full", status.dot)} />
              <span>{status.label}</span>
            </div>
            <span className="text-slate-500">{job.progress}%</span>
          </div>

          <div className="relative mt-3 h-[4px] overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${job.progress}%` }}
              transition={{ duration: 0.5 }}
              className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#00f0ff,#d946ef)] shadow-[0_0_10px_rgba(0,240,255,0.8)]"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
