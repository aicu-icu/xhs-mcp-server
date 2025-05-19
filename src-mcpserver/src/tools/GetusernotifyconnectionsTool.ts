import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
const { httpGet } = require("../xhs-browser.js");

interface GetusernotifyconnectionsInput {
  count: number;
  cursor: string;
}

class GetusernotifyconnectionsTool extends MCPTool<GetusernotifyconnectionsInput> {
  name = "获取新增关注列表";
  description = "获取用户的消息通知，新增关注分类。比如最近有哪些用户关注了我，都可以通过这个工具获取。需要两个参数，count和cursor。 cursor为下一页数据的指针，该指针为数据返回时候的cursor。如果是第一次请求，请传递空字符串（参数名必须都传递）";

  schema = {
    count: {
      type: z.number(),
      default: 20,
      description: "要获取的数据量，默认20个",
    },
    cursor: {
      type: z.string(),
      default: ' ',
      description: "下一页数据的指针，该指针为数据返回时候的cursor。如果为空，则获取第一页数据",
    }
  };

  async execute(input: GetusernotifyconnectionsInput) {
    console.log('start')
    const { count, cursor } = input;
    console.log(this.name, input, cursor)
    try {
      const res = await httpGet(`/api/sns/web/v1/you/connections?num=${count}&cursor=${cursor}`);
      console.log('ok', res)
      return JSON.stringify(res);
    } catch (e) {
      console.log('err', e)
      // @ts-ignore
      return '获取数据失败：' + e.message;
    }
  }
}

module.exports = GetusernotifyconnectionsTool;