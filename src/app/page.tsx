"use client";
import { Suspense, useEffect, useState } from "react";
import AuthButton from "@/components/landing/auth-button";
import { Link2Icon, XIcon } from "lucide-react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  useEffect(() => {
    const hasSeenDevNotes = localStorage.getItem("hasSeenDevNotes");
    if (!hasSeenDevNotes) {
      setShowDevModal(true);
    } else {
      setIsVisible(true);
    }
  }, []);

  const closeDevModal = () => {
    setShowDevModal(false);
    localStorage.setItem("hasSeenDevNotes", "true");
    // Start the fade-in animation after closing the modal
    setIsVisible(true);
  };

  const openDevModal = () => {
    setShowDevModal(true);
  };

  return (
    <div className='flex flex-col justify-between min-h-screen bg-white text-black'>
      <div className='flex-1 flex items-center justify-center p-8'>
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
                isVisible={isVisible}
              />
              <FeatureCard
                title='AI Explanations'
                description='Get AI assitance. Keep context short and relevant. Get better and more precise answers.'
                delay='delay-300'
                isVisible={isVisible}
              />
              <FeatureCard
                title='Onboarding Plan'
                description='Get a personalized onboarding plan, showing you the good first steps to get you up to speed.'
                delay='delay-500'
                isVisible={isVisible}
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

      <Footer openDevModal={openDevModal} isVisible={isVisible} />

      {showDevModal && (
        <div className='fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-xl w-full p-6 relative shadow-lg'>
            <button
              onClick={closeDevModal}
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-600'
            >
              <XIcon size={20} />
            </button>

            <h3 className='text-lg font-semibold mb-2 flex items-center'>
              <span className='mr-2'>⚠️</span> Developer Notes - Beta Version
            </h3>
            <p className='text-sm text-gray-700 mb-3'>
              CodeSherpa is in absolute beta of the betas. Please note the
              following:
            </p>
            <ul className='text-sm text-gray-700 list-disc pl-5 space-y-2'>
              <li>
                This application is connected to a free tier Supabase instance
                for metadata storage.
              </li>
              <li>
                Backend services are hosted on AWS resources that do incur
                costs.
              </li>
              <li>
                Using OpenAI API for chat completion, cheap but there&apos;s a
                monthly limit set up so heavy use can render the app unuseable
              </li>
              <li>
                Please be gentle and not import repositories that are too huge!
                Note that both source code and issues/PRs/discussions are
                analyzed, so be mindful when testing
              </li>
            </ul>

            <button
              onClick={closeDevModal}
              className='mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium mx-auto block'
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  title,
  description,
  delay,
  isVisible,
}: {
  title: string;
  description: string;
  delay: string;
  isVisible: boolean;
}) {
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

function Footer({
  openDevModal,
  isVisible,
}: {
  openDevModal: () => void;
  isVisible: boolean;
}) {
  return (
    <footer
      className={`w-full py-6 border-t border-gray-100 transition-opacity duration-700 delay-1000 ease-in ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className='w-full max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:justify-between items-center'>
        <a
          href='https://github.com/aetherjs/codesherpa'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center hover:text-purple-600 transition-colors mb-4 md:mb-0'
        >
          <svg className='h-5 w-5 mr-1' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
          </svg>
          GitHub Repository
        </a>

        <p className='text-sm text-gray-500 mb-4 md:mb-0'>
          Made with love and sometimes moderate amounts of anger by{" "}
          <a
            href='https://aetherjs.github.io/'
            className='hover:text-purple-600 transition-colors'
          >
            <Link2Icon className='inline-block w-4 h-4 mr-1' />
            Vlad Repinsky
          </a>
        </p>
        <button
          onClick={openDevModal}
          className='text-xs text-gray-400 hover:text-gray-600'
        >
          View Developer Notes
        </button>
      </div>
    </footer>
  );
}
