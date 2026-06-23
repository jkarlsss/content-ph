const audience = [
  { emoji: '🍽️', title: 'Restaurant owners', desc: 'Daily specials, promos, and events — planned ahead.' },
  { emoji: '🛍️', title: 'Online sellers', desc: 'Product posts, restock alerts, and sale announcements.' },
  { emoji: '💆', title: 'Service providers', desc: 'Salons, clinics, tutors — build trust through consistent content.' },
  { emoji: '📸', title: 'Content creators', desc: 'Stay consistent across platforms without burning out.' },
  { emoji: '🏪', title: 'Small businesses', desc: 'Any business that needs to show up online regularly.' },
  { emoji: '💼', title: 'Freelancers', desc: 'Grow your personal brand while focusing on client work.' },
];

export default function WhoItsFor() {
  return (
    <section className="bg-white border-y border-gray-200 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-center mb-2">
          Who it&apos;s for
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-10">
          If you post on social media for your work, this is for you
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {audience.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="border border-gray-200 rounded-xl p-4 text-center"
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
