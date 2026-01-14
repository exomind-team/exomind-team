import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        // 代码块
        code({ className, children }: { className?: string; children?: ReactNode }) {
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
        // 链接
        a({ href, children }: { href?: string; children?: ReactNode }) {
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
        // 图片
        img({ src, alt }: { src?: string; alt?: string }) {
          if (src) {
            return <img src={src} alt={alt || ''} className="max-w-full h-auto rounded-lg my-2" loading="lazy" />;
          }
          return null;
        },
        // 段落
        p({ children }: { children?: ReactNode }) {
          return <p className="my-2 leading-relaxed">{children}</p>;
        },
        // 标题
        h1({ children }: { children?: ReactNode }) {
          return <h1 className="text-2xl font-bold my-3">{children}</h1>;
        },
        h2({ children }: { children?: ReactNode }) {
          return <h2 className="text-xl font-bold my-2.5">{children}</h2>;
        },
        h3({ children }: { children?: ReactNode }) {
          return <h3 className="text-lg font-bold my-2">{children}</h3>;
        },
        h4({ children }: { children?: ReactNode }) {
          return <h4 className="text-base font-bold my-2">{children}</h4>;
        },
        // 无序列表 - 容器
        ul({ children }: { children?: ReactNode }) {
          return <ul className="list-disc list-inside my-2 ml-4">{children}</ul>;
        },
        // 有序列表 - 容器
        ol({ children }: { children?: ReactNode }) {
          return <ol className="list-decimal list-inside my-2 ml-4 pl-2">{children}</ol>;
        },
        // 列表项
        li({ children }: { children?: ReactNode }) {
          return <li className="my-1">{children}</li>;
        },
        // 引用
        blockquote({ children }: { children?: ReactNode }) {
          return <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-600">{children}</blockquote>;
        },
        // 粗体
        strong({ children }: { children?: ReactNode }) {
          return <strong className="font-bold">{children}</strong>;
        },
        // 斜体
        em({ children }: { children?: ReactNode }) {
          return <em className="italic">{children}</em>;
        },
        // 删除线
        del({ children }: { children?: ReactNode }) {
          return <del className="line-through">{children}</del>;
        },
        // 水平线
        hr() {
          return <hr className="my-4 border-gray-300" />;
        },
        // 表格
        table({ children }: { children?: ReactNode }) {
          return <table className="my-2 border-collapse w-full">{children}</table>;
        },
        thead({ children }: { children?: ReactNode }) {
          return <thead className="bg-gray-100">{children}</thead>;
        },
        tbody({ children }: { children?: ReactNode }) {
          return <tbody>{children}</tbody>;
        },
        tr({ children }: { children?: ReactNode }) {
          return <tr className="border-b border-gray-200">{children}</tr>;
        },
        th({ children }: { children?: ReactNode }) {
          return <th className="px-4 py-2 text-left font-bold">{children}</th>;
        },
        td({ children }: { children?: ReactNode }) {
          return <td className="px-4 py-2">{children}</td>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
