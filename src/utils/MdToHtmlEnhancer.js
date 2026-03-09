// 基于MdToHtml的增强解析器
class MdToHtmlEnhancer {
  constructor() {
    // 预编译正则表达式以提高性能
    this.patterns = {
      // 列表模式
      orderedList: /^(\d+)\.\s+(.*)/,
      unorderedList: /^[\-\*\+]\s+(.*)/,
      
      // 数学公式模式
      inlineMath: /\$(.*?)\$|\\\((.*?)\\\)/g,
      blockMath: /\$\$(.*?)\$\$|\\\[([\s\S]*?)\\\]/g,
      
      // 标题模式
      header: /^(#{1,6})\s+(.*)/,
      
      // 引用模式
      blockquote: /^>\s+(.*)/,
      
      // 分隔线模式
      hr: /^(---|\*\*\*|___)$/,
      
      // 代码块模式
      codeBlockStart: /^```(\w*)/,
      codeBlockEnd: /^```$/,
      
      // 内联元素模式
      bold: /\*\*(.*?)\*\*|__(.*?)__/g,
      italic: /(^|[^*])\*([^*]+)\*([^*]|$)|(^|[^_])_([^_]+)_([^_]|$)/g,
      code: /`([^`]+)`/g,
      link: /\[([^\]]+)\]\(([^)]+)\)/g,
      image: /!\[([^\]]*)\]\(([^)]+)\)/g,
    };
    
    // 状态变量
    this.inCodeBlock = false;
    this.codeBlockLang = '';
    this.codeBlockContent = '';
  }

  convert(markdown) {
    // 重置状态
    this.inCodeBlock = false;
    this.codeBlockLang = '';
    this.codeBlockContent = '';
    
    const lines = markdown.split('\n');
    let result = '';
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    let listItems = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // 检查是否在代码块内部
      if (this.inCodeBlock) {
        if (trimmedLine === '```') {
          // 结束代码块
          result += this.finishCodeBlock();
          continue;
        } else {
          // 添加代码行
          this.codeBlockContent += line + '\n';
          continue;
        }
      }

      // 检查是否是代码块开始
      const codeBlockMatch = trimmedLine.match(this.patterns.codeBlockStart);
      if (codeBlockMatch) {
        this.inCodeBlock = true;
        this.codeBlockLang = codeBlockMatch[1] || '';
        this.codeBlockContent = '';
        continue;
      }

      // 检查是否是列表项
      const orderedMatch = trimmedLine.match(this.patterns.orderedList);
      const unorderedMatch = trimmedLine.match(this.patterns.unorderedList);

      if (orderedMatch || unorderedMatch) {
        // 这是一行列表项
        if (!inList) {
          // 开始新列表
          inList = true;
          listType = orderedMatch ? 'ol' : 'ul';
          listItems = [];
        }

        // 添加列表项内容，同时处理内联元素
        const content = orderedMatch ? orderedMatch[2] : unorderedMatch[1];
        listItems.push(`<li>${this.processInlineElements(content)}</li>`);
      } else {
        // 不是列表项
        if (inList) {
          // 结束当前列表
          result += `<${listType}>\n${listItems.join('\n')}\n</${listType}>\n`;
          inList = false;
          listType = null;
          listItems = [];
        }

        // 处理其他类型的行
        result += this.processBlockElement(line, trimmedLine);
      }
    }

    // 如果文档以列表结束，不要忘记关闭列表
    if (inList) {
      result += `<${listType}>\n${listItems.join('\n')}\n</${listType}>\n`;
    }

    // 如果文档以代码块结束，不要忘记关闭它
    if (this.inCodeBlock) {
      result += this.finishCodeBlock();
    }

    return result;
  }

  finishCodeBlock() {
    this.inCodeBlock = false;
    const langClass = this.codeBlockLang ? ` class="language-${this.codeBlockLang}"` : '';
    const content = this.escapeHtml(this.codeBlockContent.slice(0, -1)); // 移除最后一个换行符
    return `<pre><code${langClass}>${content}</code></pre>\n`;
  }

  processBlockElement(line, trimmedLine) {
    // 标题 (# H1, ## H2, 等)
    const headerMatch = trimmedLine.match(this.patterns.header);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      return `<h${level}>${this.processInlineElements(content)}</h${level}>\n`;
    }

    // 引用 (> quote)
    const quoteMatch = trimmedLine.match(this.patterns.blockquote);
    if (quoteMatch) {
      const content = quoteMatch[1];
      return `<blockquote>${this.processInlineElements(content)}</blockquote>\n`;
    }

    // 分隔线 (---, ***, ___)
    if (trimmedLine.match(this.patterns.hr)) {
      return '<hr />\n';
    }

    // 普通段落
    if (trimmedLine !== '') {
      return `<p>${this.processInlineElements(trimmedLine)}</p>\n`;
    }

    // 空行
    return '\n';
  }

  processInlineElements(text) {
    if (!text) return '';

    // 处理数学公式
    text = this.renderMath(text);

    // 处理粗体 (**text** 或 __text__)
    text = text.replace(this.patterns.bold, (match, p1, p2) => {
      const content = p1 || p2;
      if (content) {
        return `<strong>${this.processInlineElements(content)}</strong>`;
      }
      return match;
    });

    // 处理斜体 (*text* 或 _text_)
    text = text.replace(this.patterns.italic, (match, p1, p2, p3, p4, p5, p6) => {
      const content = p2 || p5;
      if (content) {
        const prefix = p1 || p4 || '';
        const suffix = p3 || p6 || '';
        return `${prefix}<em>${this.processInlineElements(content)}</em>${suffix}`;
      }
      return match;
    });

    // 处理行内代码 (`code`)
    text = text.replace(this.patterns.code, (match, p1) => {
      return `<code>${this.escapeHtml(p1)}</code>`;
    });

    // 处理链接 ([text](url))
    text = text.replace(this.patterns.link, (match, p1, p2) => {
      return `<a href="${this.escapeHtmlAttr(p2)}">${this.processInlineElements(p1)}</a>`;
    });

    // 处理图片 (![alt](url))
    text = text.replace(this.patterns.image, (match, p1, p2) => {
      return `<img src="${this.escapeHtmlAttr(p2)}" alt="${this.escapeHtml(p1)}" />`;
    });

    return this.escapeHtml(text);
  }

  renderMath(text) {
    // 渲染行内数学公式
    text = text.replace(this.patterns.inlineMath, (match, p1, p2) => {
      const formula = p1 || p2;
      if (formula) {
        // 返回特定类名让数学库处理
        return `<span class="math-inline">\\(${formula}\\)</span>`;
      }
      return match;
    });

    // 渲染块级数学公式
    text = text.replace(this.patterns.blockMath, (match, p1, p2) => {
      const formula = p1 || p2;
      if (formula) {
        // 返回特定类名让数学库处理
        return `<div class="math-block">\\[${formula}\\]</div>`;
      }
      return match;
    });

    return text;
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  escapeHtmlAttr(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

// 导出类以便在其他地方使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MdToHtmlEnhancer;
} else {
  window.MdToHtmlEnhancer = MdToHtmlEnhancer;
}