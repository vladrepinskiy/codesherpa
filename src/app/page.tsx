"use client";
import { Suspense, useEffect, useState } from "react";
import AuthButton from "@/components/landing/auth-button";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-white text-black p-8'>
      <main className='max-w-4xl w-full flex flex-col items-center text-center'>
        <h1
          className={`text-5xl font-bold mb-6 transition-opacity duration-700 ease-in ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Welcome to CodeSherpa 🏔️
        </h1>

        <p
          className={`text-xl mb-10 max-w-2xl transition-opacity duration-700 delay-300 ease-in ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Your intelligent coding companion that guides you through complex
          codebases. Navigate, understand, and master code faster with
          AI-powered assistance.
        </p>

        <div
          className={`flex flex-col gap-6 items-center transition-opacity duration-700 delay-500 ease-in ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-10'>
            <FeatureCard
              title='Code Navigation'
              description='Navigate through complex codebases with intelligent search and context.'
              delay='delay-100'
            />
            <FeatureCard
              title='AI Explanations'
              description='Get AI assitance. Keep context short and relevant. Get better and more precise answers.'
              delay='delay-300'
            />
            <FeatureCard
              title='Onboarding Plan'
              description='Get a personalized onboarding plan, showing you the good first steps to get you up to speed.'
              delay='delay-500'
            />
          </div>

          <Suspense
            fallback={
              <div className='h-10 w-32 bg-gray-200 rounded-full animate-pulse'></div>
            }
          >
            <div
              className={`transition-opacity duration-700 delay-700 ease-in ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <AuthButton />
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  delay,
}: {
  title: string;
  description: string;
  delay: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`border border-gray-200 rounded-lg p-6 flex flex-col items-center transition-opacity duration-700 ${delay} ease-in ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      <p className='text-sm text-gray-700'>{description}</p>
    </div>
  );
}
