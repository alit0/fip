"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
        Error
      </p>
      <h1 className="mt-4 text-3xl font-black uppercase text-neutral-950 md:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-5 max-w-xl text-base text-neutral-700">
        We could not load this section. Try again or return later.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-neutral-500">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-red-600"
      >
        Try again
      </button>
    </section>
  );
}
