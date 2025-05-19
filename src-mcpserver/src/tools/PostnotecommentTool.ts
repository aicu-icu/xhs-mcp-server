import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";

const { httpPost, getJoinedTest } = require("../xhs-browser.js");
interface PostnotecommentInput {
  note_id: string;
  content: string;
}

class PostnotecommentTool extends MCPTool<PostnotecommentInput> {
  name = "发表笔记评论";
  description = "为指定的小红书笔记，发表一条文本评论";

  schema = {
    note_id: {
      type: z.string(),
      description: "小红书笔记ID",
    },
    content: {
      type: z.string(),
      description: '要发表的评论文本内容'
    }
  };
  // isTest = true;
  // enabled() {
  //   return getJoinedTest();
  // };

  async execute(input: PostnotecommentInput) {
    const { note_id, content } = input;
    if (!note_id || !content) return "错误了：缺少参数";
    try {
      const res = await httpPost('/api/sns/web/v1/comment/post', {
        at_users: [],
        content,
        note_id
      });
      if (JSON.stringify(res).includes('已发布')) {
        return `评论发布成功`;
      }
      return `评论发布失败，返回信息：${JSON.stringify(res)}`;
    } catch(e: any) {
      return `评论发布错误，信息：${e.message}`;
    }
  }
}

module.exports = PostnotecommentTool;