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
          description:
            "Astroコンポーネントを生成します。Props定義、デザイン要件、命名規則に基づいて、コンポーネントファイルとSCSSファイルを出力します。",
          inputSchema: {
            type: "object",
            properties: {
              componentName: {
                type: "string",
                description: "コンポーネント名（例: ArticleCard, HeroSection）",
              },
              props: {
                type: "object",
                description: "Props定義（TypeScriptインターフェース形式）",
                additionalProperties: true,
              },
              design: {
                type: "object",
                description: "デザイン要件（色、タイポグラフィ、レイアウト）",
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
                    description: "レイアウトタイプ（grid/flex/block）",
                  },
                },
              },
              accessibility: {
                type: "boolean",
                description: "アクセシビリティ対応を含めるか（デフォルト: true）",
                default: true,
              },
            },
            required: ["componentName", "props"],
          },
        },
        {
          name: "generate-section",
          description:
            "ページセクション（_parts配下）を生成します。セクション種類とコンテンツデータから、再利用可能なセクションコンポーネントを作成します。",
          inputSchema: {
            type: "object",
            properties: {
              sectionType: {
                type: "string",
                description:
                  "セクション種類（hero/articles/categories/qa/features/tech等）",
                enum: [
                  "hero",
                  "articles",
                  "categories",
                  "qa",
                  "features",
                  "tech",
                  "concept",
                  "videos",
                  "custom",
                ],
              },
              pageName: {
                type: "string",
                description: "所属するページ名（例: sample, about, top）",
              },
              content: {
                type: "object",
                description: "セクションのコンテンツデータ",
                additionalProperties: true,
              },
              components: {
                type: "array",
                description: "使用する子コンポーネント名のリスト",
                items: {
                  type: "string",
                },
              },
            },
            required: ["sectionType", "pageName", "content"],
          },
        },
        {
          name: "generate-page",
          description:
            "完全なAstroページを生成します。ページ構造、メタデータ、各セクションのデータから、index.astroファイルを作成します。",
          inputSchema: {
            type: "object",
            properties: {
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
            },
            required: ["pageName", "pageData", "sections"],
          },
        },
        {
          name: "generate-schema",
          description:
            "デザインデータやコンテンツ資料からTypeScript型定義とデータ構造を生成します。Excel、Markdown、JSON形式に対応。",
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
