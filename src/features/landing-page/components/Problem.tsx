const problems = [
  {
    badge: '😩 Common struggle',
    badgeType: 'red',
    q: '"Anong ipopost ko ngayon?"',
    a: 'You open your phone to post something and end up just scrolling instead.',
  },
  {
    badge: '😩 Common struggle',
    badgeType: 'red',
    q: '"Captions lang hindi problema, content planning talaga."',
    a: 'You need to know what to post, when, and why — not just how to write it.',
  },
  {
    badge: '😩 Common struggle',
    badgeType: 'red',
    q: '"Busy na nga, social media pa."',
    a: "You're running a business. Social media always ends up last minute.",
  },
  {
    badge: '✅ ContentPH fixes this',
    badgeType: 'green',
    q: 'A full content plan in minutes, not hours.',
    a: 'Ideas, captions, timing, promos — all handled. You just review and post.',
  },
];

export default function Problem() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-center mb-2">
        The problem
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-10">
        Sound familiar?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {problems.map(({ badge, badgeType, q, a }) => (
          <div
            key={q}
            className="bg-white border border-gray-300 rounded-xl p-5"
          >
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                badgeType === 'green'
                  ? 'bg-green-light text-green-dark'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {badge}
            </span>
            <p className="text-sm font-semibold text-gray-900 mb-2 leading-snug">{q}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
