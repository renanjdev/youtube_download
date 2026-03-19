import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";
import { createJob, getUserId, listJobs } from "../lib/api";
import type { FeedSource, JobMode, JobSummary, JobType } from "../lib/types";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M13.5 2L5 13h5l-1 9 8.5-11h-5L13.5 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShortUserLabel({ userId }: { userId: string }) {
  const shortId = userId ? userId.slice(0, 8).toUpperCase() : "PREVIEW";

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-midnight-light/40 px-4 py-2 shadow-lg backdrop-blur-md transition-all"
    >
      <div className="flex items-center gap-2">
         <div className="h-2 w-2 rounded-full bg-neon animate-pulse" />
         <p className="text-sm font-medium text-slate-300">user-{shortId.toLowerCase()}</p>
      </div>
    </motion.div>
  );
}

type ToggleOption<T extends string> = {
  value: T;
  label: string;
};

function ToggleGroup<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="relative flex w-full flex-1 rounded-[14px] border border-white/10 bg-midnight/80 p-1.5 shadow-inner backdrop-blur-sm">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex-1 rounded-[10px] px-4 py-3 text-sm font-semibold transition-colors ${
              selected ? "text-midnight" : "text-slate-400 hover:text-white"
            }`}
          >
            {selected && (
              <motion.div
                layoutId={`active-tab-${id}`}
                className="absolute inset-0 -z-10 rounded-[10px] bg-gradient-to-br from-neon to-fuchsia shadow-[0_4px_15px_rgba(0,240,255,0.3)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-20">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [feedSource, setFeedSource] = useState<FeedSource>("mock");
  const [userId, setUserId] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<JobMode>("video");
  const [type, setType] = useState<JobType>("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function refreshJobs() {
    setIsRefreshing(true);
    setError("");

    try {
      const feed = await listJobs();
      setJobs(feed.jobs);
      setFeedSource(feed.source);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel carregar os jobs.");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    setUserId(getUserId());
    void refreshJobs();

    const timer = window.setInterval(() => {
      void refreshJobs();
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createJob({ url, mode, type });
      setFeedSource(result.source);
      setUrl("");
      await refreshJobs();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao criar o envio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeJobs = jobs.filter((job) => job.status !== "done" && job.status !== "error");

  return (
    <main className="min-h-screen px-4 pt-6 pb-20 sm:px-6 lg:px-8 relative">
      {/* Top Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/10 text-neon shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <BoltIcon />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Neon Media</span>
        </div>
        <ShortUserLabel userId={userId} />
      </header>

      {/* Hero Section */}
      <section className="mx-auto mt-20 mb-12 flex max-w-3xl flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Baixe vídeos com{" "}
          <span className="bg-gradient-to-r from-neon to-fuchsia bg-clip-text text-transparent">
            Qualidade Premium
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-xl text-lg text-slate-400"
        >
          Cole o link do YouTube abaixo e inicie o download instantaneamente. Simples, rápido e livre de anúncios.
        </motion.p>
      </section>

      {/* Main Download Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mx-auto max-w-4xl"
      >
        <div className="rounded-[24px] border border-white/10 bg-midnight-light/60 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <input
                required
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Cole o link do YouTube aqui..."
                className="w-full rounded-[16px] border border-white/10 bg-midnight/80 px-6 py-5 text-lg text-white shadow-inner outline-none transition-all placeholder:text-slate-500 focus:border-neon focus:bg-midnight focus:ring-2 focus:ring-neon/50 sm:text-xl"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <ToggleGroup
                id="mode"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "video", label: "Vídeo (MP4)" },
                  { value: "audio", label: "Áudio (MP3)" },
                ]}
              />
              <ToggleGroup
                id="type"
                value={type}
                onChange={setType}
                options={[
                  { value: "single", label: "Apenas um" },
                  { value: "playlist", label: "Playlist inteira" },
                ]}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="group relative mt-2 w-full overflow-hidden rounded-[16px] bg-gradient-to-r from-neon to-fuchsia px-6 py-5 text-lg font-bold text-midnight shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all hover:shadow-[0_0_50px_rgba(217,70,239,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="pointer-events-none absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isSubmitting ? (
                  "Processando Link..."
                ) : (
                  <>
                    <DownloadIcon />
                    Baixar Agora
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Active Jobs Tracker */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-auto mt-20 max-w-4xl"
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Atividade Recente</h2>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-midnight-light/50 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-slate-300">
            <span className={`h-1.5 w-1.5 rounded-full ${feedSource === "mock" ? "bg-fuchsia" : "bg-emerald"} animate-pulse`} />
            {feedSource === "mock" ? "Modo Preview" : "Ao Vivo"}
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-[16px] border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-midnight/30 py-16 text-center text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" className="mb-3 h-8 w-8 text-slate-600">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Nenhum download em andamento.
            </div>
          )}
        </div>

        {activeJobs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
               onClick={() => void refreshJobs()}
               disabled={isRefreshing}
               className="text-sm font-medium text-neon hover:text-fuchsia transition-colors"
            >
              {isRefreshing ? "Sincronizando..." : `Sincronizar tarefas (${activeJobs.length} ativas)`}
            </button>
          </div>
        )}
      </motion.section>
    </main>
  );
}
