/**
 * TypeScript型定義生成
 */
export function generateTypeDefinition(
  name: string,
  data: Record<string, any>
): string {
  const interfaceBody = generateInterfaceBody(data, 1);

  return `/**
 * ${name} 型定義
 * 自動生成されたインターフェース
 */
export interface ${name} {
${interfaceBody}
}
`;
}

function generateInterfaceBody(
  data: Record<string, any>,
  indent: number
): string {
  const indentation = "  ".repeat(indent);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    const type = inferTypeFromValue(value, indent + 1);
    lines.push(`${indentation}${key}: ${type};`);
  }

  return lines.join("\n");
}

function inferTypeFromValue(value: any, indent: number): string {
  const indentation = "  ".repeat(indent);

  if (value === null || value === undefined) {
    return "any";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "any[]";
    }

    const firstItem = value[0];
    if (typeof firstItem === "object" && firstItem !== null) {
      const itemType = `{\n${generateInterfaceBody(firstItem, indent + 1)}\n${indentation}}`;
      return `${itemType}[]`;
    }

    return `${typeof firstItem}[]`;
  }

  if (typeof value === "object") {
    return `{\n${generateInterfaceBody(value, indent + 1)}\n${indentation}}`;
  }

  return typeof value;
}
