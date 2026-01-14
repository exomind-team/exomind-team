import { useRef, useEffect, useCallback } from 'react';

/**
 * 自动调整 textarea 高度的 Hook
 *
 * @param value - textarea 的值
 * @param minRows - 最小行数
 * @param maxRows - 最大行数
 * @returns ref - 绑定到 textarea 元素
 */
export function useAutoSize(
  value: string,
  minRows: number = 1,
  maxRows: number = 4
): React.RefObject<HTMLTextAreaElement> {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取计算后的行高（动态获取，避免硬编码）
  const getLineHeight = useCallback((element: HTMLTextAreaElement): number => {
    const computedStyle = window.getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    // 如果 lineHeight 是 'normal'，使用 fontSize 的 1.5 倍
    if (isNaN(lineHeight) || computedStyle.lineHeight === 'normal') {
      const fontSize = parseFloat(computedStyle.fontSize);
      return fontSize * 1.5;
    }
    return lineHeight;
  }, []);

  // 获取 padding（处理 padding）
  const getPadding = useCallback((element: HTMLTextAreaElement): number => {
    const computedStyle = window.getComputedStyle(element);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    return paddingTop + paddingBottom;
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 保存光标位置（防止跳动）
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    // 重置高度以计算正确的内容高度
    textarea.style.height = 'auto';

    // 计算行高和 padding
    const lineHeight = getLineHeight(textarea);
    const padding = getPadding(textarea);

    // 计算内容高度
    const contentHeight = textarea.scrollHeight;

    // 计算实际行数（基于内容高度）
    const rows = Math.min(
      Math.max(Math.ceil((contentHeight - padding) / lineHeight), minRows),
      maxRows
    );

    // 计算新高度（包含 padding）
    const newHeight = rows * lineHeight + padding;

    // 应用新高度
    textarea.style.height = `${newHeight}px`;

    // 恢复光标位置
    try {
      textarea.setSelectionRange(selectionStart, selectionEnd);
    } catch {
      // 某些情况下 setSelectionRange 可能失败，忽略错误
    }
  }, [value, minRows, maxRows, getLineHeight, getPadding]);

  return textareaRef;
}
