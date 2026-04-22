import { resolve, relative } from "path";

/**
 * パスがプロジェクトルート内に収まっているか検証
 * パストラバーサル攻撃を防ぐ
 */
export function assertPathWithinProject(
  resolvedPath: string,
  projectRoot: string
): void {
  const normalizedRoot = resolve(projectRoot);
  const normalizedPath = resolve(resolvedPath);
  const rel = relative(normalizedRoot, normalizedPath);

  if (rel.startsWith("..") || resolve(normalizedRoot, rel) !== normalizedPath) {
    throw new Error(
      `セキュリティエラー: パスがプロジェクト外を参照しています: ${resolvedPath}`
    );
  }
}

/**
 * ファイル名として安全な文字列か検証
 * コンポーネント名、ページ名、セクション名に使用
 */
export function validateName(name: string, label: string): void {
  if (!name || !name.trim()) {
    throw new Error(`${label}が空です`);
  }

  if (name.length > 255) {
    throw new Error(`${label}が長すぎます（最大255文字）`);
  }

  // 英数字、ハイフン、アンダースコアのみ許可（先頭は英字）
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
    throw new Error(
      `${label}に無効な文字が含まれています: "${name}"（英数字・ハイフン・アンダースコアのみ、先頭は英字）`
    );
  }
}

/**
 * 正規表現の特殊文字をエスケープ
 * ユーザー入力を RegExp パターンに使用する際の安全対策
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
