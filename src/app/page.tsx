import { Suspense } from "react";
import AuthButton from "@/components/landing/auth-button";

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-white text-black p-8'>
      <main className='max-w-4xl w-full flex flex-col items-center text-center'>
        <h1 className='text-5xl font-bold mb-6'>Welcome to CodeSherpa</h1>

        <p className='text-xl mb-10 max-w-2xl'>
          Your intelligent coding companion that guides you through complex
          codebases. Navigate, understand, and master code faster with
          AI-powered assistance.
        </p>

        <div className='flex flex-col gap-6 items-center'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-10'>
            <FeatureCard
              title='Code Navigation'
              description='Easily navigate through complex codebases with intelligent search and context.'
            />
            <FeatureCard
              title='AI Explanations'
              description='Get clear explanations of code functionality tailored to your level of expertise.'
            />
            <FeatureCard
              title='Smart Refactoring'
              description='Identify opportunities for improvement with automated code analysis.'
            />
          </div>

          <Suspense
            fallback={
              <div className='h-10 w-32 bg-gray-200 rounded-full animate-pulse'></div>
            }
          >
            <AuthButton />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='border border-gray-200 rounded-lg p-6 flex flex-col items-center'>
      <h3 className='text-lg font-semibold mb-2'>{title}</h3>
      <p className='text-sm text-gray-700'>{description}</p>
    </div>
  );
}
