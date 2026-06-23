const steps = [
  {
    num: '1',
    title: 'Set up your profile',
    desc: 'Tell us what you do, who your audience is, and what tone you want.',
  },
  {
    num: '2',
    title: 'Pick what you need',
    desc: 'Content calendar, a single caption, a promo post — you choose.',
  },
  {
    num: '3',
    title: 'Copy and post',
    desc: 'Review, pick your favorite, and post. Done in minutes.',
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-center mb-2">
        How it works
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-10">
        Ready in 3 simple steps
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map(({ num, title, desc }) => (
          <div key={num} className="text-center px-4">
            <div className="w-10 h-10 bg-green-light text-green-dark rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
              {num}
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
