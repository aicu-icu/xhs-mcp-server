import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
const { httpGet } = require("../xhs-browser.js");

interface GetusernotifymentionsInput {
  count: number;
  cursor: string;
}

class GetusernotifymentionsTool extends MCPTool<GetusernotifymentionsInput> {
  name = "获取评论相关消息通知";
  description = "获取用户的消息通知，'评论和@'分类。比如最近有哪些用户评论了我的笔记，或者在笔记中@了我，都可以通过这个工具获取。如果cursor参数为空也请传递一个空字符串";

  schema = {
    count: {
      type: z.number(),
      default: 20,
      description: "要获取的数据量，默认20个",
    },
    cursor: {
      type: z.string(),
      default: "",
      description: "下一页数据的指针，该指针为数据返回时候的cursor",
    }
  };

  async execute(input: GetusernotifymentionsInput) {
    const { count, cursor } = input;
    try {
      const res = await httpGet(`/api/sns/web/v1/you/mentions?num=${count}&cursor=${cursor}`);
      return JSON.stringify(res);
    } catch (e) {
      console.error('get home.feeds error!', e);
      return '获取数据失败了！';
    }
  }
}

module.exports = GetusernotifymentionsTool;