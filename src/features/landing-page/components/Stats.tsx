const stats = [
  { number: '30 min', label: 'or less to plan a whole month' },
  { number: '3 steps', label: 'from idea to ready-to-post' },
  { number: '100%', label: 'Filipino context built in' },
];

export default function Stats() {
  return (
    <div className="border-y border-gray-200 py-10">
      <div className="max-w-3xl mx-auto px-6 flex flex-wrap justify-center gap-10">
        {stats.map(({ number, label }) => (
          <div key={label} className="text-center">
            <div className="text-2xl font-extrabold tracking-tight text-gray-900">{number}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
