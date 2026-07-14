import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mlops And Model Infrastructure | Pixenox',
  description: 'Explore our Mlops And Model Infrastructure capabilities.',
};

export default function Page() {
  return (
    <main className="pt-[180px] min-h-screen am-container flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
          Mlops And Model Infrastructure
        </h1>
        <p className="text-xl text-white/60 font-light">
          This page is under construction.
        </p>
      </div>
    </main>
  );
}
