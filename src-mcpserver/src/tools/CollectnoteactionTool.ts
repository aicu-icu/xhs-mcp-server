import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
const { httpPost, getJoinedTest } = require("../xhs-browser.js");

interface CollectnoteactionInput {
  note_id: string;
  collect: boolean;
}

class CollectnoteactionTool extends MCPTool<CollectnoteactionInput> {
  name = "笔记收藏操作";
  description = "根据笔记id，对小红书笔记进行收藏/取消收藏操作";

  schema = {
    note_id: {
      type: z.string(),
      description: "小红书笔记的ID",
    },
    collect: {
      type: z.boolean(),
      default: true,
      description: "true为收藏，false为取消收藏"
    }
  };
  // isTest = true;
  // enabled() {
  //   return getJoinedTest();
  // };
  async execute(input: CollectnoteactionInput) {
    const { note_id, collect } = input;
    if (!collect) {
      // 取消
      try {
        await httpPost('/api/sns/web/v1/note/uncollect', {
          note_ids: note_id
        });
        return '取消收藏笔记成功';
      } catch(e: any) {
        return `取消收藏失败，错误信息：${e.message}`;
      }
    } else {
      // 操作
      try {
        await httpPost('/api/sns/web/v1/note/collect', {
          note_id
        });
        return "收藏笔记成功";
      } catch(e: any) {
        return `收藏失败，错误信息：${e.message}`
      }
    }
  }
}

module.exports = CollectnoteactionTool;