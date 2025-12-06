/**
 * Common.astro 編集機能
 * サイト全体の設定（head, menu）を解析・更新する
 */

export interface HeadConfig {
  siteName?: string;
  domain?: string;
  favicon?: string;
  ogImg?: string;
  logo?: string;
  copyright?: string;
  webfont?: string;
  twitterName?: string;
  facebookID?: string;
}

export interface MenuItem {
  link: string;
  txt: string;
  child?: MenuItem[];
  anchor?: boolean;
  blank?: boolean;
}

export interface CommonUpdateConfig {
  head?: HeadConfig;
  menu?: MenuItem[];
}

/**
 * Common.astro の内容を解析
 */
export function parseCommonAstro(content: string): {
  head: HeadConfig;
  menu: MenuItem[];
  fullContent: string;
} {
  // head セクションの抽出
  const headMatch = content.match(/head:\s*{([^}]+)}/s);
  const head: HeadConfig = {};

  if (headMatch) {
    const headContent = headMatch[1];

    // 各プロパティを正規表現で抽出
    const extractValue = (key: string): string | undefined => {
      const match = headContent.match(new RegExp(`${key}:\\s*"([^"]*)"`, 's'));
      return match ? match[1] : undefined;
    };

    head.siteName = extractValue('siteName');
    head.domain = extractValue('domain');
    head.favicon = extractValue('favicon');
    head.ogImg = extractValue('ogImg');
    head.logo = extractValue('logo');
    head.copyright = extractValue('copyright');
    head.webfont = extractValue('webfont');
    head.twitterName = extractValue('twitterName');
    head.facebookID = extractValue('facebookID');
  }

  // menu セクションの抽出（簡易版、実際のパースは複雑）
  const menuMatch = content.match(/menu:\s*\[([^\]]+)\]/s);
  const menu: MenuItem[] = [];

  // 既存の完全なコンテンツを保持
  return {
    head,
    menu,
    fullContent: content,
  };
}

/**
 * Common.astro の head セクションを更新
 */
export function updateCommonHead(
  originalContent: string,
  updates: HeadConfig
): string {
  let updatedContent = originalContent;

  // 各プロパティを更新
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      // 既存の行を置換
      const regex = new RegExp(`(${key}:\\s*)"[^"]*"`, 'g');
      const replacement = `$1"${value}"`;

      if (updatedContent.match(regex)) {
        updatedContent = updatedContent.replace(regex, replacement);
      }
    }
  }

  return updatedContent;
}

/**
 * Common.astro の menu セクションを更新
 */
export function updateCommonMenu(
  originalContent: string,
  menuItems: MenuItem[]
): string {
  // menu配列を文字列化
  const menuString = formatMenuArray(menuItems);

  // 既存のmenu配列を置換
  const regex = /menu:\s*\[[^\]]*\]/s;
  const replacement = `menu: ${menuString}`;

  return originalContent.replace(regex, replacement);
}

/**
 * MenuItem配列をAstro形式の文字列に変換
 */
function formatMenuArray(items: MenuItem[], indent: number = 2): string {
  const spaces = ' '.repeat(indent);
  const lines: string[] = ['['];

  items.forEach((item, index) => {
    lines.push(`${spaces}  {`);
    lines.push(`${spaces}    link: "${item.link}",`);
    lines.push(`${spaces}    txt: "${item.txt}",`);

    if (item.anchor !== undefined) {
      lines.push(`${spaces}    anchor: ${item.anchor},`);
    }

    if (item.blank !== undefined) {
      lines.push(`${spaces}    blank: ${item.blank},`);
    }

    if (item.child && item.child.length > 0) {
      const childString = formatMenuArray(item.child, indent + 4);
      lines.push(`${spaces}    child: ${childString},`);
    }

    lines.push(`${spaces}  }${index < items.length - 1 ? ',' : ''}`);
  });

  lines.push(`${spaces}]`);
  return lines.join('\n');
}

/**
 * Common.astro全体を更新
 */
export function updateCommonAstro(
  originalContent: string,
  config: CommonUpdateConfig
): string {
  let updatedContent = originalContent;

  // head セクションの更新
  if (config.head) {
    updatedContent = updateCommonHead(updatedContent, config.head);
  }

  // menu セクションの更新
  if (config.menu) {
    updatedContent = updateCommonMenu(updatedContent, config.menu);
  }

  return updatedContent;
}
