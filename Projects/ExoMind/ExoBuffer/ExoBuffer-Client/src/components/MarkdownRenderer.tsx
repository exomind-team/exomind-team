import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

// 简单的组件类型
type MarkdownComponentProps = {
  className?: string;
  children?: React.ReactNode;
  href?: string;
  src?: string;
  alt?: string;
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        // 代码块
        code(props: MarkdownComponentProps) {
          const { className, children } = props;
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
        a(props: MarkdownComponentProps) {
          const { href, children } = props;
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
        img(props: MarkdownComponentProps) {
          const { src, alt } = props;
          if (src) {
            return <img src={src} alt={alt || ''} className="max-w-full h-auto rounded-lg my-2" loading="lazy" />;
          }
          return null;
        },
        // 段落
        p(props: MarkdownComponentProps) {
          return <p className="my-2 leading-relaxed">{props.children}</p>;
        },
        // 标题
        h1(props: MarkdownComponentProps) {
          return <h1 className="text-2xl font-bold my-3">{props.children}</h1>;
        },
        h2(props: MarkdownComponentProps) {
          return <h2 className="text-xl font-bold my-2.5">{props.children}</h2>;
        },
        h3(props: MarkdownComponentProps) {
          return <h3 className="text-lg font-bold my-2">{props.children}</h3>;
        },
        h4(props: MarkdownComponentProps) {
          return <h4 className="text-base font-bold my-2">{props.children}</h4>;
        },
        // 列表
        ul(props: MarkdownComponentProps) {
          return <ul className="list-disc list-inside my-2 space-y-1">{props.children}</ul>;
        },
        ol(props: MarkdownComponentProps) {
          return <ol className="list-decimal list-inside my-2 space-y-1">{props.children}</ol>;
        },
        li(props: MarkdownComponentProps) {
          return <li className="my-0.5">{props.children}</li>;
        },
        // 引用
        blockquote(props: MarkdownComponentProps) {
          return <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-600">{props.children}</blockquote>;
        },
        // 粗体
        strong(props: MarkdownComponentProps) {
          return <strong className="font-bold">{props.children}</strong>;
        },
        // 斜体
        em(props: MarkdownComponentProps) {
          return <em className="italic">{props.children}</em>;
        },
        // 删除线
        del(props: MarkdownComponentProps) {
          return <del className="line-through">{props.children}</del>;
        },
        // 水平线
        hr() {
          return <hr className="my-4 border-gray-300" />;
        },
        // 预格式化文本
        pre(props: MarkdownComponentProps) {
          return <pre className="my-2 overflow-auto">{props.children}</pre>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
