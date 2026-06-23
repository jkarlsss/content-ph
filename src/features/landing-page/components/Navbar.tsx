'use client';

import { Button } from "../../../components/ui/button";

export default function Navbar() {
  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-50 border-b border-gray-200">
      <div className="mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-extrabold tracking-tight text-gray-900">
          Content<span className="text-primary">PH</span>
        </div>
        <Button
          onClick={scrollToSignup}
        >
          Get early access
        </Button>
      </div>
    </nav>
  );
}
