import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  // 检测是否为 Markdown 内容
  // 包含：粗体、斜体、代码、链接、图片、标题、列表、引用等
  const markdownPatterns = [
    /[*]{2}.*[*]{2}/,           // **粗体**
    /[*].*[*]/,                 // *斜体*
    /[`]{1,3}[^`]*[`]{1,3}/,    // `代码` 或 ``代码``
    /[#]+ /,                    // # 标题
    /^[-*+][ ]/,                // - 无序列表
    /^\d+[.][ ]/,               // 1. 有序列表
    /[>][ ]/,                   // > 引用
    /[!]\[[^\]]*\]\(/,          // ![图片](url)
    /\[[^\]]*\]\(/,             // [链接](url)
    /[|]/,                      // | 表格
  ];

  const isMarkdown = markdownPatterns.some(pattern => pattern.test(content));

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
