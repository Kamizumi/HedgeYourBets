'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function GetStartedButton({ session, className = "" }) {
  const router = useRouter();

  const handleClick = () => {
    // Always navigate to the get-started page
    router.push('/get-started');
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm ${className}`}
    >
      Get Started
    </button>
  );
}