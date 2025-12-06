import { generateAstroComponent } from "../generators/astroGenerator.js";
import { generateScss } from "../generators/scssGenerator.js";
import { formatCode } from "../utils/formatter.js";

interface ComponentArgs {
  componentName: string;
  props: Record<string, any>;
  design?: {
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    layout?: "grid" | "flex" | "block";
  };
  accessibility?: boolean;
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
  } = args as ComponentArgs;

  try {
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

    return {
      content: [
        {
          type: "text",
          text: `✅ コンポーネント「${componentName}」を生成しました\n\n## Astroコンポーネント\n\`\`\`astro\n${formattedAstro}\n\`\`\`\n\n## SCSS\n\`\`\`scss\n${formattedScss}\n\`\`\`\n\n### 配置先\n- \`src/components/${componentName}.astro\`\n- \`src/scss/components/_c_${toKebabCase(componentName)}.scss\``,
        },
      ],
    };
  } catch (error) {
    throw new Error(`コンポーネント生成エラー: ${error}`);
  }
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
