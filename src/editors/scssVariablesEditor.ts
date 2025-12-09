/**
 * _variables.scss 編集機能
 * SCSS変数（カラー、サイズ、ブレークポイント）を解析・更新する
 */

export interface ColorVariables {
  'color-body'?: string;
  'color-txt'?: string;
  'color-reversal'?: string;
  'color-gray'?: string;
  'color-prime'?: string;
  'color-second'?: string;
  'color-third'?: string;
}

export interface LayoutVariables {
  brakePoint?: number;
  containerSize?: number;
  containerPadding?: number;
}

export interface FontSizeConfig {
  pc: number;
  sp: number;
}

export interface FontSizeVariables {
  h1?: FontSizeConfig;
  h2?: FontSizeConfig;
  h3?: FontSizeConfig;
  h4?: FontSizeConfig;
  h5?: FontSizeConfig;
  xl?: FontSizeConfig;
  lg?: FontSizeConfig;
  base?: FontSizeConfig;
  sm?: FontSizeConfig;
  xs?: FontSizeConfig;
}

export interface ScssVariablesConfig {
  colors?: ColorVariables;
  layout?: LayoutVariables;
  fontSizes?: FontSizeVariables;
}

/**
 * _variables.scss の内容を解析
 */
export function parseScssVariables(content: string): {
  colors: ColorVariables;
  layout: LayoutVariables;
  fontSizes: FontSizeVariables;
} {
  const colors: ColorVariables = {};
  const layout: LayoutVariables = {};
  const fontSizes: FontSizeVariables = {};

  // カラー変数を抽出
  const colorPattern = /\$color-([\w-]+):\s*([^;]+);/g;
  let match;
  while ((match = colorPattern.exec(content)) !== null) {
    const key = `color-${match[1]}` as keyof ColorVariables;
    colors[key] = match[2].trim();
  }

  // レイアウト変数を抽出
  const brakePointMatch = content.match(/\$brakePoint:\s*(\d+);/);
  if (brakePointMatch) {
    layout.brakePoint = parseInt(brakePointMatch[1]);
  }

  const containerSizeMatch = content.match(/\$containerSize:\s*(\d+);/);
  if (containerSizeMatch) {
    layout.containerSize = parseInt(containerSizeMatch[1]);
  }

  const containerPaddingMatch = content.match(/\$containerPadding:\s*(\d+);/);
  if (containerPaddingMatch) {
    layout.containerPadding = parseInt(containerPaddingMatch[1]);
  }

  // フォントサイズ変数を抽出（例: $h1: 64, 40;）
  const fontSizePattern = /\$(h[1-5]|xl|lg|base|sm|xs):\s*(\d+),\s*(\d+);/g;
  while ((match = fontSizePattern.exec(content)) !== null) {
    const key = match[1] as keyof FontSizeVariables;
    fontSizes[key] = {
      pc: parseInt(match[2]),
      sp: parseInt(match[3]),
    };
  }

  return { colors, layout, fontSizes };
}

/**
 * カラー変数を更新
 */
export function updateScssColors(
  originalContent: string,
  colors: ColorVariables
): string {
  let updatedContent = originalContent;

  for (const [key, value] of Object.entries(colors)) {
    if (value !== undefined) {
      // $color-prime: #1d4ed8; のような行を置換
      const varName = key.replace('color-', '');
      const regex = new RegExp(`\\$color-${varName}:\\s*[^;]+;`, 'g');
      const replacement = `$color-${varName}: ${value};`;

      updatedContent = updatedContent.replace(regex, replacement);
    }
  }

  return updatedContent;
}

/**
 * レイアウト変数を更新
 */
export function updateScssLayout(
  originalContent: string,
  layout: LayoutVariables
): string {
  let updatedContent = originalContent;

  if (layout.brakePoint !== undefined) {
    updatedContent = updatedContent.replace(
      /\$brakePoint:\s*\d+;/,
      `$brakePoint: ${layout.brakePoint};`
    );
  }

  if (layout.containerSize !== undefined) {
    updatedContent = updatedContent.replace(
      /\$containerSize:\s*\d+;/,
      `$containerSize: ${layout.containerSize};`
    );
  }

  if (layout.containerPadding !== undefined) {
    updatedContent = updatedContent.replace(
      /\$containerPadding:\s*\d+;/,
      `$containerPadding: ${layout.containerPadding};`
    );
  }

  return updatedContent;
}

/**
 * フォントサイズ変数を更新
 */
export function updateScssFontSizes(
  originalContent: string,
  fontSizes: FontSizeVariables
): string {
  let updatedContent = originalContent;

  for (const [key, value] of Object.entries(fontSizes)) {
    if (value !== undefined) {
      const regex = new RegExp(`\\$${key}:\\s*\\d+,\\s*\\d+;`, 'g');
      const replacement = `$${key}: ${value.pc}, ${value.sp};`;

      updatedContent = updatedContent.replace(regex, replacement);
    }
  }

  return updatedContent;
}

/**
 * _variables.scss 全体を更新
 */
export function updateScssVariables(
  originalContent: string,
  config: ScssVariablesConfig
): string {
  let updatedContent = originalContent;

  if (config.colors) {
    updatedContent = updateScssColors(updatedContent, config.colors);
  }

  if (config.layout) {
    updatedContent = updateScssLayout(updatedContent, config.layout);
  }

  if (config.fontSizes) {
    updatedContent = updateScssFontSizes(updatedContent, config.fontSizes);
  }

  return updatedContent;
}
