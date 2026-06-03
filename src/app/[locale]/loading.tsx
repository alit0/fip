export default function Loading() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-red-600" />
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-neutral-600">
        Loading
      </p>
    </section>
  );
}
