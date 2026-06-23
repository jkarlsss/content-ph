const features = [
  {
    icon: '📅',
    title: 'Content calendar',
    desc: 'Get a full month of post ideas planned out — no more guessing what to post each day.',
  },
  {
    icon: '📸',
    title: 'Photo to caption',
    desc: 'Upload your product or food photo and AI writes the perfect caption instantly.',
  },
  {
    icon: '🎙️',
    title: 'Your brand voice',
    desc: 'Set your tone — professional, friendly, jolly — every post sounds like you.',
  },
  {
    icon: '🏷️',
    title: 'Promo builder',
    desc: 'Turn your offers, discounts, and events into ready-to-post content in seconds.',
  },
  {
    icon: '⏰',
    title: 'Best time to post',
    desc: 'Know when your audience is most active so your posts actually get seen.',
  },
  {
    icon: '🇵🇭',
    title: 'Filipino context',
    desc: 'Knows local holidays, Taglish, OPM culture — built for the way Pinoys actually talk.',
  },
];

export default function Features() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-center mb-2">
        Features
      </p>
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-10">
        Everything you need to post with confidence
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white border border-gray-300 rounded-xl p-5 hover:border-green-mid transition-colors duration-150"
          >
            <div className="w-10 h-10 bg-green-light rounded-lg flex items-center justify-center text-lg mb-4">
              {icon}
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
