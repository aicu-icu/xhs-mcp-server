import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
const { httpGet } = require("../xhs-browser.js");


interface GetusernotifylikesInput {
  count: number;
  cursor: string;
}

class GetusernotifylikesTool extends MCPTool<GetusernotifylikesInput> {
  name = "获取赞和收藏通知消息";
  description = "获取当前用户的消息通知，赞和收藏分类。比如最近有哪些用户点赞了我的笔记，或者收藏了我的笔记，都可以通过这个工具获取。如果cursor参数为空也请传递一个空字符串";

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

  async execute(input: GetusernotifylikesInput) {
    const { count, cursor } = input;
    try {
      const res = await httpGet(`/api/sns/web/v1/you/likes?num=${count}&cursor=${cursor}`);
      return JSON.stringify(res);
    } catch (e) {
      return '获取数据失败了！';
    }
  }
}

module.exports = GetusernotifylikesTool;