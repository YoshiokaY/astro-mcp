import * as XLSX from "xlsx";

/**
 * Excelファイル解析
 */
export async function parseExcel(filePath: string): Promise<any> {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // シートをJSONに変換
    const data = XLSX.utils.sheet_to_json(worksheet);

    // データ構造を推測して整形
    return inferStructureFromExcel(data);
  } catch (error) {
    throw new Error(`Excel解析エラー: ${error}`);
  }
}

function inferStructureFromExcel(data: any[]): any {
  if (!data || data.length === 0) {
    return {};
  }

  // 最初の行からキーを取得
  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  // ページ構造として整形
  const structure: any = {
    head: {},
    contents: {},
  };

  // セクション情報を抽出
  data.forEach((row) => {
    const sectionType = row["セクション種類"] || row["section"];
    if (sectionType) {
      if (!structure.contents[sectionType]) {
        structure.contents[sectionType] = {
          ttl: row["タイトル"] || row["title"] || "",
          items: [],
        };
      }

      // アイテムデータを追加
      const item: any = {};
      keys.forEach((key) => {
        if (key !== "セクション種類" && key !== "section") {
          item[key] = row[key];
        }
      });

      if (Object.keys(item).length > 0) {
        structure.contents[sectionType].items.push(item);
      }
    }
  });

  return structure;
}
