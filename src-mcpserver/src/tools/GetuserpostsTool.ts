import { MCPTool } from "@aicu/mcp-framework";
import { object, z } from "zod";

const { httpGet, sleep, jsonToCsv, downloadCsvData } = require("../xhs-browser.js");

interface GetuserpostsInput {
  user_id: string;
  count: number;
  xsec_token: string;
  download: boolean;
}

class GetuserpostsTool extends MCPTool<GetuserpostsInput> {
  name = "获取用户笔记列表";
  description = "获取指定用户的已发布笔记列表。需要提供所有参数";

  schema = {
    user_id: {
      type: z.string(),
      description: "用户的ID，不是小红书id，24个字符长度"
    },
    count: {
      type: z.number(),
      default: 5,
      description: "要获取的笔记的数量，默认5个，如果要获取全部，则值为-1"
    },
    xsec_token: {
      type: z.string(),
      description: "请求参数校验的xsec_token，这个必须填写"
    },
    // cursor: {
    //   type: z.string(),
    //   default: "",
    //   description: "下一页数据的指针，该指针为请求数据返回时候的cursor"
    // },
    download: {
      type: z.boolean(),
      description: '是否下载导出数据成文件。如果用户特别指明了要下载，则为true，否则默认false',
      default: false
    }
  };

  async execute(input: GetuserpostsInput) {
    let { user_id, count, xsec_token, download } = input;
    const results: any[] = [];
    let cursor = '';
    while (true) {
      try {
        const res = await httpGet(`/api/sns/web/v1/user_posted?num=10&cursor=${cursor}&user_id=${user_id}&image_formats=jpg,webp,avif&xsec_token=${encodeURIComponent(xsec_token)}&xsec_source=pc_feed`);
        if (!res['notes'] || res['notes'].length === 0) break;
        // @ts-ignore
        res['notes'].map(note => {
          if ((count > 0 ) && (results.length >= count)) return;
          results.push({
            note_id: note['noteId'],
            title: note['displayTitle'],
            type: note['type'],
            user: {
              id: note['user']['userId'],
              nick_name: note['user']['nickName']
            },
            xsec_token: note['xsecToken'],
            liked_count: note['interactInfo']['likedCount'],
            cover: note['cover']['urlPre']
          })
        });
        if (!res['hasMore']) break;
        cursor = res['cursor'];
      } catch (e) {
        // @ts-ignore
        return '获取用户数据失败：' + e.message;
      }
      if ((count !== -1) && (results.length >= count)) break;
      await sleep(2);

    }
    const result_csv = jsonToCsv(results, [
      'note_id', 'type', 'title', 'xsec_token', 'liked_count', 'cover', 
      'user_id@user.id', 'user_name@user.nick_name'
    ]);
    if (download) {
      const fileName = `user_posts_${user_id}_${count}_${+new Date}.csv`;
      const download_result = downloadCsvData(fileName, result_csv);
      return download_result['error'] ? `数据保存失败：${download_result['error']}` : `数据已保存。条数：${results.length}。文件：${download_result.link}`;
    }
    return result_csv;

  }
}

module.exports = GetuserpostsTool;