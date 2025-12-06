/**
 * コード整形ユーティリティ（簡易版）
 * 基本的な整形のみ実施
 */
export async function formatCode(
  code: string,
  parser: "astro" | "scss" | "typescript"
): Promise<string> {
  // 簡易的な整形処理
  // 生成されたコードをそのまま返す
  // 実際のプロジェクトではPrettierで整形することを推奨
  return code;
}
