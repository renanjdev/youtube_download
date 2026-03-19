import React, { useEffect, useMemo, useState } from 'react';
import JobCard from '../components/JobCard';
import { createJob, listJobs, getUserId } from '../lib/api';

export default function Home() {
  const [inputs, setInputs] = useState({ url: '', mode: 'video', type: 'single' });
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const userId = useMemo(() => getUserId(), []);

  const reloadJobs = async () => {
    setRefreshing(true);
    try {
      const data = await listJobs();
      setJobs(data);
    } catch (caught) {
      console.error(caught);
      setError(caught instanceof Error ? caught.message : 'Falha ao listar jobs');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    reloadJobs();
    const interval = setInterval(reloadJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createJob({ url: inputs.url, mode: inputs.mode as 'video' | 'audio', type: inputs.type as 'single' | 'playlist' });
      setInputs((prev) => ({ ...prev, url: '' }));
      await reloadJobs();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-midnight px-4 pb-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 pt-12">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Media Synth Lab</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Transforme URLs em arquivos prontos para download.</h1>
          <p className="text-slate-300">Dashboard futurista para baixar vídeos, playlists ou apenas áudios do YouTube e monitorar tudo em tempo real.</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate/20 p-8 shadow-neon">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-slate-400">Step 1</p>
              <h2 className="text-2xl font-semibold text-white">Revenue-grade Download Studio</h2>
            </div>
            <p className="text-xs text-slate-400">Seu ID: <span className="text-neon">{userId}</span></p>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-[1.4fr_0.6fr]" onSubmit={handleSubmit}>
            <input
              required
              value={inputs.url}
              onChange={(event) => setInputs((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="Cole a URL do vídeo ou playlist"
              className="rounded-2xl border border-white/20 bg-slate/40 p-4 text-sm text-white placeholder:text-slate-400 focus:border-neon focus:outline-none"
            />

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#111727] p-4">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Modo</label>
              <select
                value={inputs.mode}
                onChange={(event) => setInputs((prev) => ({ ...prev, mode: event.target.value }))}
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
              >
                <option value="video">Vídeo</option>
                <option value="audio">Áudio</option>
              </select>

              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Tipo</label>
              <select
                value={inputs.type}
                onChange={(event) => setInputs((prev) => ({ ...prev, type: event.target.value }))}
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
              >
                <option value="single">Vídeo único</option>
                <option value="playlist">Playlist completa</option>
              </select>
            </div>

            <button
              className="col-span-full items-center justify-center rounded-2xl border border-neon/70 bg-gradient-to-r from-neon to-[#7b3cff] px-6 py-4 text-lg font-semibold uppercase tracking-[0.3em] text-midnight transition hover:brightness-125"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Enviando...' : 'Baixar'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Dashboard de Jobs</h2>
            <button
              onClick={reloadJobs}
              className="text-sm font-semibold uppercase tracking-[0.3em] text-neon"
            >
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          <div className="grid gap-6" aria-live="polite">
            {jobs.length === 0 && (
              <div className="rounded-3xl border border-white/20 bg-slate/30 p-8 text-center text-slate-400">
                Ainda não há downloads processados. Envie uma URL acima para iniciar.
              </div>
            )}

            {jobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
