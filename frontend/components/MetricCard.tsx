type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export default function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-[rgba(10,24,36,0.62)] p-5 backdrop-blur">
      <p className="mono text-[0.68rem] uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </article>
  );
}
