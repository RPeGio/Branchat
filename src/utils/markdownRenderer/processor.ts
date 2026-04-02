import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'

/**
 * 将 Markdown 内容处理为 HTML 字符串的异步函数
 *
 * @param content - 原始 Markdown 文本内容
 * @returns 处理后的 HTML 字符串
 */
export async function processMarkdown(content: string) {
    // 预处理数学公式标记：
    // 1. 将 \(公式\) 格式的行内数学公式转换为 $公式$ 格式，以便 remark-math 正确识别
    // 2. 将 \[公式\] 格式的块级数学公式转换为 $$公式$$ 格式，以便 remark-math 正确识别
    const processed = content
        .replace(/\\\(([^]*?)\\\)/g, (_, math) => `$${math}$`)
        .replace(/\\\[([^]*?)\\\]/g, (_, math) => `$$${math}$$`)

    // 创建统一处理器实例，并配置处理流水线
    const processor = unified()
        // 使用 remark-parse 将 Markdown 文本解析为 MDAST
        .use(remarkParse)
        // 使用 remark-gfm 添加对 GFM 扩展语法的支持
        .use(remarkGfm)
        // 使用 remark-math 识别和解析数学公式语法
        .use(remarkMath)
        // 使用 remark-rehype 将 MDAST 转换为 HAST (HTML AST)
        .use(remarkRehype)
        // 使用 rehype-raw 允许保留原始 HTML 标签
        .use(rehypeRaw)
        // 使用 rehype-katex 将数学公式渲染为美观的数学符号
        .use(rehypeKatex)
        // 添加 rehype-stringify 将 HAST 编译为 HTML 字符串
        .use(rehypeStringify)

    // 执行处理流程，将预处理后的内容转换为 HTML
    const file = await processor.process(processed)

    // 返回处理结果中的 HTML 字符串
    return file.value as string
}
