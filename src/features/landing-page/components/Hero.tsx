'use client';

import { useState } from 'react';
import { BottomCTAProps } from './BottomCTA';
import { Button } from '../../../components/ui/button';

const audiences = [
  { emoji: '🍽️', label: 'Restaurants' },
  { emoji: '🛍️', label: 'Online sellers' },
  { emoji: '💆', label: 'Service providers' },
  { emoji: '📸', label: 'Content creators' },
  { emoji: '💼', label: 'Freelancers' },
];

export default function Hero({ count, onSignup } : BottomCTAProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!email || !email.includes('@')) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    onSignup(email);
    setSubmitted(true);
    setEmail('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
      {/* Eyebrow */}
      <span className="inline-block bg-green-light text-green-dark text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
        🇵🇭 Built for Filipinos
      </span>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-5 text-balance">
        Your AI social media{' '}
        <em className="not-italic text-primary">content partner</em>
      </h1>

      {/* Subheadline */}
      <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto mb-8">
        From restaurant owners to online sellers to freelancers — ContentPH helps you plan, write,
        and post content consistently without spending hours figuring out what to say.
      </p>

      {/* Audience tags */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {audiences.map(({ emoji, label }) => (
          <span
            key={label}
            className="bg-white border border-gray-300 text-gray-600 text-sm font-medium px-4 py-1.5 rounded-full"
          >
            {emoji} {label}
          </span>
        ))}
      </div>

      {/* Signup box */}
      <div id="signup" className="bg-white border border-gray-300 rounded-2xl p-8 max-w-md mx-auto">
        <p className="text-sm text-gray-500 mb-4">
          We&apos;re launching soon. Be first in line — free access for early sign-ups.
        </p>

        {submitted ? (
          <div className="bg-green-light text-green-dark text-sm font-semibold px-4 py-3 rounded-lg">
            Salamat! You&apos;re on the early access list. 🎉
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="your@email.com"
              className={`flex-1 min-w-0 px-4 py-2.5 text-sm border rounded-lg bg-gray-50 text-gray-900 outline-none transition-colors duration-150 ${
                error ? 'border-red-500' : 'border-gray-300 focus:border-green-primary'
              }`}
            />
            <Button
              size={"lg"}
              onClick={handleSubmit}
            >
              Notify me
            </Button>
          </div>
        )}

        {/* Signup count */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="w-2 h-2 bg-green-primary rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">{count} Filipinos already signed up</span>
        </div>
      </div>
    </section>
  );
}
