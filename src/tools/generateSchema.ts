import { parseExcel } from "../parsers/excelParser.js";
import { parseMarkdown } from "../parsers/markdownParser.js";
import { generateTypeDefinition } from "../generators/typeGenerator.js";
import { formatCode } from "../utils/formatter.js";

interface SchemaArgs {
  sourceType: "excel" | "markdown" | "json" | "text";
  sourceData: string;
  schemaName: string;
}

/**
 * スキーマ生成ツール
 */
export async function generateSchema(args: any) {
  const { sourceType, sourceData, schemaName } = args as SchemaArgs;

  try {
    let parsedData: any;

    // データソースに応じてパース
    switch (sourceType) {
      case "excel":
        parsedData = await parseExcel(sourceData);
        break;
      case "markdown":
        parsedData = await parseMarkdown(sourceData);
        break;
      case "json":
        parsedData = JSON.parse(sourceData);
        break;
      case "text":
        // テキストから構造を推測
        parsedData = inferStructureFromText(sourceData);
        break;
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }

    // TypeScript型定義生成
    const typeDefinition = generateTypeDefinition(schemaName, parsedData);

    // コード整形
    const formatted = await formatCode(typeDefinition, "typescript");

    return {
      content: [
        {
          type: "text",
          text: `✅ スキーマ「${schemaName}」を生成しました\n\n\`\`\`typescript\n${formatted}\n\`\`\`\n\n### 使用例\n\`\`\`typescript\nconst page: ${schemaName} = {\n  // データを記述\n};\n\`\`\``,
        },
      ],
    };
  } catch (error) {
    throw new Error(`スキーマ生成エラー: ${error}`);
  }
}

function inferStructureFromText(text: string): Record<string, any> {
  // シンプルなテキスト解析（改善の余地あり）
  const lines = text.split("\n").filter((line) => line.trim());
  const structure: Record<string, any> = {};

  for (const line of lines) {
    if (line.includes(":")) {
      const [key, value] = line.split(":").map((s) => s.trim());
      structure[key] = inferType(value);
    }
  }

  return structure;
}

function inferType(value: string): string {
  if (!isNaN(Number(value))) return "number";
  if (value === "true" || value === "false") return "boolean";
  if (value.startsWith("[") && value.endsWith("]")) return "array";
  if (value.startsWith("{") && value.endsWith("}")) return "object";
  return "string";
}
