interface AstroComponentConfig {
  name: string;
  props: Record<string, any>;
  accessibility: boolean;
}

/**
 * Astroコンポーネントコード生成
 */
export async function generateAstroComponent(
  config: AstroComponentConfig
): Promise<string> {
  const { name, props, accessibility = true } = config;

  // Props定義からTypeScript interfaceを生成
  const propsInterface = generatePropsInterface(props);

  // Props destructuringを生成
  const propsDestructuring = Object.keys(props).join(", ");

  // コンポーネント本体を生成
  const componentBody = generateComponentBody(name, props, accessibility);

  return `---
/**
 * ${name} コンポーネント
 */
${propsInterface}

const { ${propsDestructuring} } = Astro.props;
---

${componentBody}
`;
}

function generatePropsInterface(props: Record<string, any>): string {
  const lines = ["interface Props {"];

  for (const [key, config] of Object.entries(props)) {
    const typeInfo = typeof config === "object" ? config : { type: config };
    const optional = typeInfo.optional ? "?" : "";
    const type = mapTypeToTS(typeInfo.type || "string");
    const comment = typeInfo.description
      ? `  /** ${typeInfo.description} */\n`
      : "";

    lines.push(`${comment}  ${key}${optional}: ${type};`);
  }

  lines.push("}");
  return lines.join("\n");
}

function mapTypeToTS(type: string): string {
  const typeMap: Record<string, string> = {
    text: "string",
    string: "string",
    number: "number",
    boolean: "boolean",
    date: "string",
    url: "string",
    array: "string[]",
    object: "Record<string, any>",
  };

  return typeMap[type] || "string";
}

function generateAriaAttributes(props: Record<string, any>): string {
  // Props に応じた適切なARIA属性を生成
  const hasInteraction = Object.keys(props).some((key) =>
    ["onClick", "onSubmit", "href"].includes(key)
  );

  if (hasInteraction) {
    return ' role="button" tabindex="0"';
  }

  return "";
}

function generateComponentBody(
  name: string,
  props: Record<string, any>,
  accessibility: boolean
): string {
  const className = `c_${toSnakeCase(name)}`;

  // シンプルなカード型コンポーネントのテンプレート
  const propKeys = Object.keys(props);
  const hasImage = propKeys.some((key) => key.includes("img") || key === "src");
  const hasTitle = propKeys.some((key) => key.includes("ttl") || key === "title");
  const hasDesc = propKeys.some(
    (key) => key.includes("desc") || key === "description"
  );

  // アクセシビリティ対応のaria属性
  const ariaAttrs = accessibility ? generateAriaAttributes(props) : "";

  let body = `<div class="${className}"${ariaAttrs}>`;

  if (hasImage) {
    const imgProp = propKeys.find((key) => key.includes("img") || key === "src");
    const altProp = propKeys.find((key) => key.includes("alt")) || "alt";
    const altRequired = accessibility ? ` alt={${altProp}}` : "";
    body += `\n  <div class="${className}_img">
    <img src={${imgProp}}${altRequired} loading="lazy" />
  </div>`;
  }

  body += `\n  <div class="${className}_body">`;

  if (hasTitle) {
    const titleProp = propKeys.find(
      (key) => key.includes("ttl") || key === "title"
    );
    body += `\n    <h3 class="${className}_ttl">{${titleProp}}</h3>`;
  }

  if (hasDesc) {
    const descProp = propKeys.find(
      (key) => key.includes("desc") || key === "description"
    );
    body += `\n    <p class="${className}_desc">{${descProp}}</p>`;
  }

  // その他のpropsを表示
  for (const key of propKeys) {
    if (
      !key.includes("img") &&
      !key.includes("alt") &&
      !key.includes("ttl") &&
      !key.includes("desc") &&
      !key.includes("title") &&
      !key.includes("description")
    ) {
      body += `\n    <div class="${className}_${toSnakeCase(key)}">{${key}}</div>`;
    }
  }

  body += `\n  </div>`;
  body += `\n</div>`;

  return body;
}

function toSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}
