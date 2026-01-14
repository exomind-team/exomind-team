import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  // 检测是否为 Markdown 内容（简单启发式：包含 Markdown 语法）
  const isMarkdown = /[*_`#\[\]()>]/.test(content);

  if (isMarkdown) {
    return (
      <div className="message-markdown">
        <MarkdownRenderer content={content} />
      </div>
    );
  }

  // 普通文本：保持原有渲染方式
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {content}
    </p>
  );
}
