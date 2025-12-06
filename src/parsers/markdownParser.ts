import matter from "gray-matter";

/**
 * Markdownファイル解析
 */
export async function parseMarkdown(content: string): Promise<any> {
  try {
    const { data, content: body } = matter(content);

    // フロントマターとコンテンツを構造化
    return {
      meta: data,
      content: body,
      structure: inferStructureFromMarkdown(body),
    };
  } catch (error) {
    throw new Error(`Markdown解析エラー: ${error}`);
  }
}

function inferStructureFromMarkdown(content: string): any {
  const structure: any = {
    sections: [],
  };

  // 見出しでセクション分割
  const lines = content.split("\n");
  let currentSection: any = null;

  lines.forEach((line) => {
    // H2見出しで新しいセクション
    if (line.startsWith("## ")) {
      if (currentSection) {
        structure.sections.push(currentSection);
      }
      currentSection = {
        ttl: line.replace("## ", "").trim(),
        content: [],
      };
    }
    // H3見出しでサブセクション
    else if (line.startsWith("### ")) {
      if (currentSection) {
        currentSection.content.push({
          type: "subtitle",
          text: line.replace("### ", "").trim(),
        });
      }
    }
    // リストアイテム
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (currentSection) {
        if (!currentSection.items) {
          currentSection.items = [];
        }
        currentSection.items.push(line.replace(/^[-*] /, "").trim());
      }
    }
    // 通常のテキスト
    else if (line.trim() && currentSection) {
      currentSection.content.push({
        type: "text",
        text: line.trim(),
      });
    }
  });

  // 最後のセクションを追加
  if (currentSection) {
    structure.sections.push(currentSection);
  }

  return structure;
}
