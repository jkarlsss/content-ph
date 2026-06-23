'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';

export type BottomCTAProps = {
  count: number;
  onSignup: (email: string) => void;
}

export default function BottomCTA({ count, onSignup } : BottomCTAProps) {
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
    <section className="max-w-xl mx-auto px-6 py-24 text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4 text-balance">
        Stop putting off your social media
      </h2>
      <p className="text-base text-gray-600 leading-relaxed mb-8">
        Join hundreds of Filipinos getting early access to ContentPH. Sign up now and get your
        first month free when we launch.
      </p>

      {submitted ? (
        <div className="bg-green-light text-green-dark text-sm font-semibold px-6 py-4 rounded-xl inline-block">
          Salamat! You&apos;re on the list. 🎉
        </div>
      ) : (
        <div className="flex gap-2 justify-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="your@email.com"
            className={`flex-1 max-w-xs px-4 py-2.5 text-sm border rounded-lg bg-white text-gray-900 outline-none transition-colors duration-150 ${
              error ? 'border-red-500' : 'border-gray-300 focus:border-green-primary'
            }`}
          />
          <Button
          size={"lg"}
            onClick={handleSubmit}
            >
            Get early access
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="w-2 h-2 bg-green-primary rounded-full animate-pulse" />
        <span className="text-xs text-gray-500">{count} Filipinos already signed up</span>
      </div>
    </section>
  );
}
