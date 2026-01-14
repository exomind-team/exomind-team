import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const isInline = !className;

          if (!isInline && language) {
            return (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-lg my-2 overflow-hidden text-sm"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }

          return (
            <code className={`${className || ''} bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono`}>
              {children}
            </code>
          );
        },
        a({ href, children }) {
          const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
          return (
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          );
        },
        img({ src, alt }) {
          if (src) {
            return <img src={src} alt={alt || ''} className="max-w-full h-auto rounded-lg my-2" loading="lazy" />;
          }
          return null;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
