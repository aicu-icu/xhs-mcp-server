import { MCPTool } from "@aicu/mcp-framework";
const { httpGet } = require("../xhs-browser.js");

interface GetselfinfoInput {}

class GetselfinfoTool extends MCPTool<GetselfinfoInput> {
  name = "获取当前账号的详细数据";
  description = "获取当前账号的详细数据，包括昵称、id、头像、粉丝数据等";

  schema = {};

  async execute(input: GetselfinfoInput) {
    try {
      const res1 = await httpGet('/api/sns/web/v2/user/me');
      const res2 = await httpGet(`/api/sns/web/v1/user/selfinfo`);
      return JSON.stringify({
        user: res1,
        moreinfo: res2
      });
    } catch (e) {
      // @ts-ignore
      return '获取用户数据失败：' + e.message;
    }
  }
}

module.exports = GetselfinfoTool;