import { SequenceBuilder } from "@/components/sequence-builder";

export default function NewSequencePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">New sequence</h1>
        <p className="mt-1 text-sm text-white/55">
          Pick a trigger, then add timed email steps. Use{" "}
          <code className="rounded bg-white/10 px-1 py-0.5">{`{{name}}`}</code>,{" "}
          <code className="rounded bg-white/10 px-1 py-0.5">{`{{email}}`}</code>,{" "}
          <code className="rounded bg-white/10 px-1 py-0.5">{`{{appointment_at}}`}</code> as
          template variables.
        </p>
      </header>
      <SequenceBuilder />
    </div>
  );
}
