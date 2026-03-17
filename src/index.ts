#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { generateComponent } from "./tools/generateComponent.js";
import { generateSection } from "./tools/generateSection.js";
import { generatePage } from "./tools/generatePage.js";
import { generateSchema } from "./tools/generateSchema.js";
import { getProjectContext } from "./tools/getProjectContext.js";
import { getComponentInterface } from "./tools/getComponentInterface.js";

/**
 * Astro Generator MCP Server
 * データ駆動型Astroプロジェクト生成ツール
 */
class AstroGeneratorServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "astro-generator",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // ツール一覧の提供
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "generate-component",
          description: `Astroコンポーネントを生成し、ファイルシステムに書き込みます。

【重要】Astroコンポーネントを新規作成する場合は、独自にコードを書かずに必ずこのツールを使用してください。

出力先:
- src/components/{componentName}.astro
- src/scss/components/_c_{snake_case_name}.scss

使用例:
{
  "componentName": "ArticleCard",
  "props": { "title": "string", "description": "string", "image": "string" },
  "projectRoot": "/path/to/project"
}`,
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description: "コンポーネント名（PascalCase、例: ArticleCard, HeroSection）",
              },
              props: {
                type: "object",
                description: "Props定義（TypeScriptインターフェース形式）。キーがプロパティ名、値が型（string/number/boolean/array/object）",
                additionalProperties: true,
              },
              design: {
                type: "object",
                description: "デザイン要件（任意）",
                properties: {
                  colors: {
                    type: "object",
                    description: "カラー定義",
                  },
                  typography: {
                    type: "object",
                    description: "フォント設定",
                  },
                  layout: {
                    type: "string",
                    description: "レイアウトタイプ",
                    enum: ["grid", "flex", "block"],
                  },
                },
              },
              accessibility: {
                type: "boolean",
                description: "アクセシビリティ対応を含めるか",
                default: true,
              },
              projectRoot: {
                type: "string",
                description: "プロジェクトルートパス（デフォルト: カレントディレクトリ）",
              },
            },
            required: ["componentName", "props"],
          },
        },
        {
          name: "generate-section",
          description: `ページセクション（_parts配下）を生成し、ファイルシステムに書き込みます。

【重要】Astroページのセクションを作成する場合は、独自にコードを書かずに必ずこのツールを使用してください。

出力先:
- src/pages/_parts/_{pageName}/_{sectionType}.astro
- src/scss/pages/_{pageName}.scss（既存ファイルには追記）

自動更新:
- src/js/app.js（UIパターンに必要なスクリプトを自動登録）

使用例:
{
  "pageName": "about",
  "sectionType": "features",
  "uiPattern": "grid",
  "projectRoot": "/path/to/project"
}`,
          inputSchema: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description:
                  "セクション生成の意図を自然言語で記述（例: 記事一覧をカード形式で表示、Q&Aをアコーディオンで）。sectionTypeとuiPatternを自動推論します。",
              },
              sectionType: {
                type: "string",
                description:
                  "セクション種類。promptを指定しない場合は必須。",
                enum: [
                  "hero",
                  "articles",
                  "categories",
                  "qa",
                  "features",
                  "tech",
                  "concept",
                  "videos",
                  "gallery",
                  "modal",
                  "custom",
                ],
              },
              uiPattern: {
                type: "string",
                description:
                  "UIパターン。指定しない場合はsectionTypeに応じたデフォルトを使用。",
                enum: ["tab", "accordion", "grid", "carousel", "list", "modal"],
              },
              pageName: {
                type: "string",
                description: "所属するページ名（例: sample, about, top）",
              },
              content: {
                type: "object",
                description: "セクションのコンテンツデータ（任意）",
                additionalProperties: true,
              },
              components: {
                type: "array",
                description: "使用する子コンポーネント名のリスト（任意）",
                items: {
                  type: "string",
                },
              },
              projectRoot: {
                type: "string",
                description: "プロジェクトルートパス（デフォルト: カレントディレクトリ）",
              },
            },
            required: ["pageName"],
          },
        },
        {
          name: "generate-page",
          description: `完全なAstroページを生成し、ファイルシステムに書き込みます。

【重要】Astroページを新規作成する場合は、独自にコードを書かずに必ずこのツールを使用してください。

出力先:
- src/pages/{pageName}/index.astro

自動更新（オプション指定時）:
- src/layouts/Common.astro（siteConfig指定時）
- src/scss/abstracts/_variables.scss（scssConfig指定時）

機能:
- promptでページタイプ（トップ/下層）を自動判定
- 下層ページの場合はBreadcrumbsとLowerTitleを自動追加

使用例:
{
  "pageName": "about",
  "prompt": "会社概要の下層ページ",
  "pageData": { "head": { "slug": "about", "ttl": "会社概要", "description": "...", "url": "/about/" }, "contents": {} },
  "sections": ["hero", "company"],
  "projectRoot": "/path/to/project"
}`,
          inputSchema: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "ページ生成の意図を記述（例: 会社概要の下層ページを作成、トップページを作成）",
              },
              pageName: {
                type: "string",
                description: "ページ名（例: about, sample, contact）",
              },
              pageData: {
                type: "object",
                description: "ページ全体のデータ構造",
                properties: {
                  head: {
                    type: "object",
                    description: "メタデータ（slug, ttl, description, url）",
                  },
                  breadcrumbs: {
                    type: "array",
                    description: "パンくずリスト",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        url: { type: "string" },
                      },
                      additionalProperties: true,
                    },
                  },
                  contents: {
                    type: "object",
                    description: "各セクションのコンテンツデータ",
                    additionalProperties: true,
                  },
                },
                required: ["head", "contents"],
              },
              sections: {
                type: "array",
                description: "使用するセクション名のリスト",
                items: {
                  type: "string",
                },
              },
              siteConfig: {
                type: "object",
                description:
                  "サイト全体の設定（Common.astro更新用、任意）",
                properties: {
                  head: {
                    type: "object",
                    description:
                      "headセクション（siteName, domain, favicon, ogImg, logo, copyright, webfont, twitterName, facebookID）",
                    additionalProperties: true,
                  },
                  menu: {
                    type: "array",
                    description: "メニュー項目の配列",
                    items: {
                      type: "object",
                    },
                  },
                },
              },
              scssConfig: {
                type: "object",
                description: "SCSS変数設定（_variables.scss更新用、任意）",
                properties: {
                  colors: {
                    type: "object",
                    description:
                      "カラー変数（color-prime, color-second, color-third等）",
                    additionalProperties: true,
                  },
                  layout: {
                    type: "object",
                    description:
                      "レイアウト変数（brakePoint, containerSize, containerPadding）",
                    additionalProperties: true,
                  },
                  fontSizes: {
                    type: "object",
                    description:
                      "フォントサイズ変数（h1〜xs、各{pc, sp}形式）",
                    additionalProperties: true,
                  },
                },
              },
              projectRoot: {
                type: "string",
                description:
                  "プロジェクトルートパス（デフォルト: カレントディレクトリ）",
              },
            },
            required: ["pageName", "pageData", "sections"],
          },
        },
        {
          name: "generate-schema",
          description: `デザインデータやコンテンツ資料からTypeScript型定義とデータ構造を生成します。

【重要】データ構造の型定義が必要な場合は、独自に型を書かずにこのツールを使用してください。

対応形式: Excel、Markdown、JSON、テキスト

使用例:
{
  "sourceType": "json",
  "sourceData": "{ \"title\": \"記事タイトル\", \"items\": [...] }",
  "schemaName": "ArticleData"
}`,
          inputSchema: {
            type: "object",
            properties: {
              sourceType: {
                type: "string",
                description: "データソースの種類",
                enum: ["excel", "markdown", "json", "text"],
              },
              sourceData: {
                type: "string",
                description:
                  "ソースデータ（Excelの場合はファイルパス、それ以外は文字列データ）",
              },
              schemaName: {
                type: "string",
                description: "生成する型定義の名前（例: PageData, ArticleData）",
              },
            },
            required: ["sourceType", "sourceData", "schemaName"],
          },
        },
        {
          name: "get-project-context",
          description: `プロジェクトのコーディング規約、ディレクトリ構造の役割、使用可能な技術スタック、およびAIが守るべき制約事項を取得します。タスクを開始する前に必ず一度実行してください。

取得内容:
- コーディング規約（ai-context.md または .cursorrules から読み込み）
- プロジェクト構造（src/配下の主要ディレクトリ一覧）
- SCSS変数の要約（カラー、レイアウト、フォントサイズ）

使用例:
{
  "projectRoot": "/path/to/project"
}`,
          inputSchema: {
            type: "object",
            properties: {
              projectRoot: {
                type: "string",
                description:
                  "プロジェクトルートパス（デフォルト: カレントディレクトリ）",
              },
            },
            required: [],
          },
        },
        {
          name: "get-component-interface",
          description: `コンポーネントのProps型定義を取得します。ファイル全体を読み込まず、interfaceのみを返すためトークン効率が高いです。

componentNameを指定すると単一コンポーネント、省略すると全コンポーネントの一覧を返します。

使用例:
- 単一: { "componentName": "Picture", "projectRoot": "/path/to/project" }
- 一覧: { "projectRoot": "/path/to/project" }`,
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description:
                  "コンポーネント名（例: Picture, Breadcrumbs）。省略で全コンポーネント一覧",
              },
              projectRoot: {
                type: "string",
                description:
                  "プロジェクトルートパス（デフォルト: カレントディレクトリ）",
              },
            },
            required: [],
          },
        },
      ],
    }));

    // ツール実行ハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case "generate-component":
            return await generateComponent(request.params.arguments);

          case "generate-section":
            return await generateSection(request.params.arguments);

          case "generate-page":
            return await generatePage(request.params.arguments);

          case "generate-schema":
            return await generateSchema(request.params.arguments);

          case "get-project-context":
            return await getProjectContext(request.params.arguments);

          case "get-component-interface":
            return await getComponentInterface(request.params.arguments);

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Astro Generator MCP Server running on stdio");
  }
}

const server = new AstroGeneratorServer();
server.run().catch(console.error);
