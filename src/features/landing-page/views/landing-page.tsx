'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Problem from '../components/Problem';
import Features from '../components/Features';
import WhoItsFor from '../components/WhoItsFor';
import HowItWorks from '../components/HowItWorks';
import BottomCTA from '../components/BottomCTA';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [count, setCount] = useState(124);

  const handleSignup = (email: string) => {
    console.log('New signup:', email);
    setCount((prev) => prev + 1);
  };

  return (
    <main className="bg-gray-50">
      <Navbar />
      <Hero count={count} onSignup={handleSignup} />
      <Stats />
      <Problem />
      <Features />
      <WhoItsFor />
      <HowItWorks />
      <BottomCTA count={count} onSignup={handleSignup} />
      <Footer />
    </main>
  );
}