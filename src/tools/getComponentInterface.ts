import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, basename } from "path";
import { validateName, assertPathWithinProject } from "../utils/security.js";

interface ComponentInterfaceArgs {
  componentName?: string;
  projectRoot?: string;
}

interface ComponentSummary {
  name: string;
  props: string;
  description: string;
}

/**
 * コンポーネントインターフェース取得ツール
 * .astroファイルの---フェンス内からProps interfaceを抽出して返す
 */
export async function getComponentInterface(args: any) {
  const { componentName, projectRoot = process.cwd() } =
    args as ComponentInterfaceArgs;

  const componentsDir = resolve(projectRoot, "src/components");

  if (!existsSync(componentsDir)) {
    return {
      content: [
        {
          type: "text",
          text: "⚠️ src/components/ ディレクトリが見つかりません",
        },
      ],
    };
  }

  // 特定コンポーネント指定の場合
  if (componentName) {
    const rawName = componentName.endsWith(".astro")
      ? componentName.slice(0, -6)
      : componentName;
    validateName(rawName, "コンポーネント名");
    const fileName = `${rawName}.astro`;
    const filePath = resolve(componentsDir, fileName);
    assertPathWithinProject(filePath, projectRoot);

    if (!existsSync(filePath)) {
      return {
        content: [
          {
            type: "text",
            text: `⚠️ コンポーネントが見つかりません: ${fileName}`,
          },
        ],
      };
    }

    const summary = extractComponentSummary(filePath);
    return {
      content: [
        {
          type: "text",
          text: formatSummary(summary),
        },
      ],
    };
  }

  // 全コンポーネント一括取得
  const files = readdirSync(componentsDir).filter((f) => f.endsWith(".astro"));

  if (files.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "ℹ️ src/components/ にAstroコンポーネントがありません",
        },
      ],
    };
  }

  const summaries = files.map((file) =>
    extractComponentSummary(resolve(componentsDir, file))
  );

  const output = summaries.map(formatSummary).join("\n\n---\n\n");

  return {
    content: [
      {
        type: "text",
        text: `## コンポーネント一覧（${summaries.length}件）\n\n${output}`,
      },
    ],
  };
}

/**
 * .astroファイルからProps interfaceとJSDocコメントを抽出
 */
function extractComponentSummary(filePath: string): ComponentSummary {
  const name = basename(filePath, ".astro");
  const content = readFileSync(filePath, "utf-8");

  // ---フェンス内を抽出
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { name, props: "(Props定義なし)", description: "" };
  }

  const frontmatter = frontmatterMatch[1];

  // Props interface を抽出（interface Props { ... } のブロック全体）
  const propsMatch = frontmatter.match(
    /interface\s+Props\s*\{([\s\S]*?)^\}/m
  );
  const props = propsMatch
    ? `interface Props {${propsMatch[1]}}`
    : "(Props定義なし)";

  // JSDocコメントを抽出（Props直前の /** ... */ ）
  const jsdocMatch = frontmatter.match(
    /\/\*\*[\s\S]*?\*\/\s*(?=\n\s*interface\s+Props)/
  );
  const description = jsdocMatch
    ? jsdocMatch[0]
        .replace(/\/\*\*|\*\//g, "")
        .replace(/^\s*\*\s?/gm, "")
        .trim()
    : "";

  return { name, props, description };
}

/**
 * サマリーを整形して返す
 */
function formatSummary(summary: ComponentSummary): string {
  const lines = [`### ${summary.name}`];

  if (summary.description) {
    lines.push(summary.description);
  }

  lines.push(`\`\`\`typescript\n${summary.props}\n\`\`\``);

  return lines.join("\n");
}
