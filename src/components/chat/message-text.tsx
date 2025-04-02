"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

interface MessageTextProps {
  content: string;
}

export function MessageText({ content }: MessageTextProps) {
  return (
    <div className='prose dark:prose-invert prose-sm max-w-none'>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: (props) => <p className='mb-4 leading-relaxed' {...props} />,
          h1: (props) => (
            <h1 className='mt-6 mb-3 text-xl font-semibold' {...props} />
          ),
          h2: (props) => (
            <h2 className='mt-5 mb-3 text-lg font-semibold' {...props} />
          ),
          h3: (props) => (
            <h3 className='mt-4 mb-2 text-base font-semibold' {...props} />
          ),
          ul: (props) => <ul className='my-3 pl-6 list-disc' {...props} />,
          ol: (props) => <ol className='my-3 pl-6 list-decimal' {...props} />,
          li: (props) => <li className='mb-2' {...props} />,
          blockquote: (props) => (
            <blockquote
              className='pl-4 my-4 border-l-4 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
              {...props}
            />
          ),
          code: ({ className, ...props }) => {
            if (className) {
              return <code className={className} {...props} />;
            }
            return (
              <code
                className='px-1.5 py-0.5 mx-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-sm'
                {...props}
              />
            );
          },
          pre: (props) => (
            <pre className='my-4 rounded-md overflow-x-auto' {...props} />
          ),
          table: (props) => (
            <div className='overflow-x-auto my-4'>
              <table
                className='min-w-full divide-y divide-gray-300 dark:divide-gray-700'
                {...props}
              />
            </div>
          ),
          th: (props) => (
            <th
              className='px-3 py-2 text-left text-xs font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800'
              {...props}
            />
          ),
          td: (props) => (
            <td
              className='px-3 py-2 border-t border-gray-200 dark:border-gray-800'
              {...props}
            />
          ),
          hr: (props) => (
            <hr
              className='my-6 border-gray-200 dark:border-gray-800'
              {...props}
            />
          ),
          a: (props) => (
            <a
              className='text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline'
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
