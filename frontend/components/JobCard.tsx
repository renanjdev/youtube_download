import { motion } from 'framer-motion';
import clsx from 'clsx';

type JobCardProps = {
  id: string;
  status: 'pending' | 'processing' | 'done' | string;
  mode: string;
  type: string;
  url: string;
  created_at: string;
  files: Array<{ id: string; file_url: string; file_type: string }>;
};

const statusProgress: Record<string, number> = {
  pending: 18,
  processing: 68,
  done: 100,
  error: 100,
};

const statusColor: Record<string, string> = {
  pending: 'text-yellow-300',
  processing: 'text-yellow-200',
  done: 'text-green-300',
  error: 'text-rose-300',
};

export default function JobCard({ status, mode, type, url, created_at, files }: JobCardProps) {
  const progress = statusProgress[status] ?? 40;
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <motion.div
      className={clsx(
        'border-[1px] border-[#25304a] bg-slate/10 rounded-3xl p-5 shadow-neon',
        'backdrop-blur-xl'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-300">{new Date(created_at).toLocaleString()}</p>
          <p className="text-lg font-semibold">{host}</p>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {mode} • {type}
          </p>
        </div>
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-[0.75rem] font-semibold bg-slate/20',
            statusColor[status] ?? 'text-slate-300'
          )}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon to-lavender"
          style={{ width: `${progress}%` }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {files.map((file) => (
            <a
              key={file.id}
              href={file.file_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-neon/50 bg-slate/30 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-neon transition hover:border-neon"
            >
              Download {file.file_type.toUpperCase()}
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
