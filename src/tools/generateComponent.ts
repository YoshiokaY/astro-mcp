import { generateAstroComponent } from "../generators/astroGenerator.js";
import { generateScss } from "../generators/scssGenerator.js";
import { formatCode } from "../utils/formatter.js";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { getGenerationContext } from "../utils/projectContext.js";

interface ComponentArgs {
  componentName: string;
  props: Record<string, any>;
  design?: {
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    layout?: "grid" | "flex" | "block";
  };
  accessibility?: boolean;
  projectRoot?: string;
}

/**
 * Astroコンポーネント生成ツール
 */
export async function generateComponent(args: any) {
  const {
    componentName,
    props,
    design = {},
    accessibility = true,
    projectRoot = process.cwd(),
  } = args as ComponentArgs;

  try {
    const writeLogs: string[] = [];

    // 1. Astroコンポーネント生成
    const astroCode = await generateAstroComponent({
      name: componentName,
      props,
      accessibility,
    });

    // 2. SCSS生成
    const scssCode = await generateScss({
      name: componentName,
      design,
    });

    // 3. コード整形
    const formattedAstro = await formatCode(astroCode, "astro");
    const formattedScss = await formatCode(scssCode, "scss");

    // 4. ファイルパス解決
    const astroPath = resolve(
      projectRoot,
      `src/components/${componentName}.astro`
    );
    const scssPath = resolve(
      projectRoot,
      `src/scss/components/_c_${toSnakeCase(componentName)}.scss`
    );

    // 5. ディレクトリ作成 & ファイル書き込み
    try {
      // Astroコンポーネント
      mkdirSync(dirname(astroPath), { recursive: true });
      writeFileSync(astroPath, formattedAstro, "utf-8");
      writeLogs.push(`✅ ${astroPath}`);

      // SCSSファイル
      mkdirSync(dirname(scssPath), { recursive: true });
      writeFileSync(scssPath, formattedScss, "utf-8");
      writeLogs.push(`✅ ${scssPath}`);
    } catch (writeError) {
      writeLogs.push(`❌ ファイル書き込みエラー: ${writeError}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `✅ コンポーネント「${componentName}」を生成しました\n\n### ファイル出力\n${writeLogs.join("\n")}\n\n## Astroコンポーネント\n\`\`\`astro\n${formattedAstro}\n\`\`\`\n\n## SCSS\n\`\`\`scss\n${formattedScss}\n\`\`\`${getGenerationContext(projectRoot)}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(`コンポーネント生成エラー: ${error}`);
  }
}

function toSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}
