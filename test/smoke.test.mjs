/**
 * スモークテスト
 * ビルド済みサーバー（dist/index.js）を stdio で起動し、ツールが登録されているか確認する
 * 依存更新（Dependabot）で実行時に壊れていないかを検知する目的
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

const expectedTools = [
  "generate-component",
  "generate-section",
  "generate-page",
  "generate-schema",
  "get-project-context",
  "get-component-interface",
];

test("サーバーが起動し、すべてのツールが登録されている", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    stderr: "ignore",
  });
  const client = new Client({ name: "smoke-test", version: "0.0.0" });

  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name).sort();

    assert.deepEqual(names, [...expectedTools].sort());
  } finally {
    await client.close();
  }
});
