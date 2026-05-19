import Link from 'next/link';

const SUGGESTED = [
  { title: 'Music classes', emoji: '🎵' },
  { title: 'Soccer', emoji: '⚽️' },
  { title: 'Swimming', emoji: '🏊' },
  { title: 'Karate', emoji: '🥋' },
  { title: 'Dance', emoji: '💃' },
  { title: 'Coding', emoji: '💻' },
  { title: 'Robotics / Lego', emoji: '🤖' },
  { title: 'Math Olympiad', emoji: '🧮' },
  { title: 'Science Olympiad', emoji: '🔬' }
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Activities &amp; classes</h1>
        <p className="text-sm text-slate-500">
          Discover what kids near you are loving. Coming soon — for now, browse categories or ask
          the community.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SUGGESTED.map((s) => (
          <div key={s.title} className="card flex items-center gap-3">
            <span className="text-2xl">{s.emoji}</span>
            <p className="text-sm font-medium">{s.title}</p>
          </div>
        ))}
      </div>

      <div className="card text-center">
        <h2 className="text-base font-semibold">Have a class to recommend?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Post it in the community so other parents can find it.
        </p>
        <Link href="/community/new" className="btn-primary mt-4 inline-flex">
          Share a recommendation
        </Link>
      </div>
    </div>
  );
}
