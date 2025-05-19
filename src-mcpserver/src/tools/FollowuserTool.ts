import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
const { httpPost } = require("../xhs-browser.js");

interface FollowuserInput {
  target_user_id: string;
  follow: boolean;
}

class FollowuserTool extends MCPTool<FollowuserInput> {
  name = "关注用户操作";
  description = "根据用户id，关注或取消关注用户";

  schema = {
    target_user_id: {
      type: z.string(),
      description: "目标用户ID，24位字符串",
    },
    follow: {
      type: z.boolean(),
      default: true,
      description: "true为关注，false为取消关注"
    }
  };

  async execute(input: FollowuserInput) {
    const { target_user_id, follow } = input;
    if (!follow) {
      // 取消
      try {
        await httpPost('/api/sns/web/v1/user/unfollow', {
          target_user_id
        });
        return '取消关注用户成功';
      } catch(e: any) {
        return `取消关注失败，错误信息：${e.message}`;
      }
    } else {
      // 操作
      try {
        await httpPost('/api/sns/web/v1/user/follow', {
          target_user_id
        });
        return "关注用户成功";
      } catch(e: any) {
        return `关注失败，错误信息：${e.message}`
      }
    }
  }
}

module.exports = FollowuserTool;