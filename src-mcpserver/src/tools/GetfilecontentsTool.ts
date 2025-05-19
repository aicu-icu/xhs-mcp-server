import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
import fs from 'node:fs';

interface GetfilecontentsInput {
  filePath: string;
}

class GetfilecontentsTool extends MCPTool<GetfilecontentsInput> {
  name = "获取本地文件内容";
  description = "获取指定路径的本地文件的内容，返回文件的字符串数据";

  schema = {
    filePath: {
      type: z.string(),
      required: true,
      description: "要读取的文件的本地路径（绝对路径）",
    },
  };

  async execute(input: GetfilecontentsInput) {
    const { filePath } = input;
    try {
      const data = fs.readFileSync(filePath).toString('utf-8');
      return data;
    } catch(e: any) {
      return '读取文件失败：' + e.message;
    }
  }
}

module.exports = GetfilecontentsTool;