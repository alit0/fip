import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
        404
      </p>
      <h1 className="mt-4 text-3xl font-black uppercase text-neutral-950 md:text-5xl">
        Page not found
      </h1>
      <p className="mt-5 max-w-xl text-base text-neutral-700">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-red-600"
      >
        Go home
      </Link>
    </section>
  );
}
