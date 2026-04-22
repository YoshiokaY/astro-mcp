import ExcelJS from "exceljs";

/**
 * Excelファイル解析
 */
export async function parseExcel(filePath: string): Promise<any> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error("シートが見つかりません");
    }

    // ヘッダー行を取得
    const headerRow = worksheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? "");
    });

    // データ行をJSON配列に変換
    const data: Record<string, any>[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData: Record<string, any> = {};
      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber];
        if (key) {
          rowData[key] = cell.value;
        }
      });
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

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
