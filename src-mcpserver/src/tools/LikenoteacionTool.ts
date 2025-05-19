import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
const { httpPost, getJoinedTest } = require("../xhs-browser.js");

interface LikenoteacionInput {
  note_id: string;
  like: boolean;
}

class LikenoteacionTool extends MCPTool<LikenoteacionInput> {
  name = "笔记点赞操作";
  description = "根据笔记id，对小红书笔记进行点赞/取消点赞操作";

  schema = {
    note_id: {
      type: z.string(),
      description: "小红书笔记的ID",
    },
    like: {
      type: z.boolean(),
      default: true,
      description: "true为点赞，false为取消点赞"
    }
  };
  // isTest = true;
  // enabled() {
  //   return getJoinedTest();
  // };
  async execute(input: LikenoteacionInput) {
    const { note_id, like } = input;
    if (!like) {
      // 取消点赞
      try {
        await httpPost('/api/sns/web/v1/note/dislike', {
          note_oid: note_id
        });
        return '取消点赞笔记成功';
      } catch(e: any) {
        return `取消点赞失败，错误信息：${e.message}`;
      }
    } else {
      // 点赞
      try {
        await httpPost('/api/sns/web/v1/note/like', {
          note_oid: note_id
        })
        return "点赞笔记成功";
      } catch(e: any) {
        return `点赞失败，错误信息：${e.message}`
      }
    }
  }
}

module.exports = LikenoteacionTool;