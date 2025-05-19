import { MCPTool } from "@aicu/mcp-framework";

const { httpGet, downloadCsvData, sleep } = require("../xhs-browser.js");

import { z } from "zod";

interface GetnotecommentsInput {
  note_id: string;
  xsec_token: string;
  count: number;
  download: boolean;
}

class GetnotecommentsTool extends MCPTool<GetnotecommentsInput> {
  name = "获取笔记评论列表";
  description = "获取指定小红书笔记的评论列表数据。用户可以指定获取的数量（如果要获取全部则为-1）。用户还可以指定是否导出、下载数据。请注意：所有参数必须填写，否则无法获取数据。";

  schema = {
    note_id: {
      type: z.string(),
      description: "笔记的note_id",
    },
    xsec_token: {
      type: z.string(),
      description: "笔记对应的xsec_token",
    },
    count: {
      type: z.number().min(-1).max(1000),
      default: 10,
      description: "要获取的评论的数据量，默认获取10条。如果用户指定了要获取全部的数据，则值为-1。",
    },
    download: {
      type: z.boolean(),
      default: false,
      description: "是否下载导出评论数据",
    }
  };

  async execute(input: GetnotecommentsInput) {
    const { note_id, count, download } = input;
    let xsec_token = input.xsec_token;
    try {
      let cursor = '';
      let result_arr: any[] = [];
      while (true) {
        // 获取数量够了
        console.log('[start]', count, cursor, xsec_token);
        if ((count !== -1) && (result_arr.length >= count)) break;
        let res = null;
        try {
          res = await httpGet(`/api/sns/web/v2/comment/page?note_id=${note_id}&cursor=${cursor}&top_comment_id=&image_formats=jpg,webp,avif&xsec_token=${encodeURIComponent(xsec_token)}`);
        } catch (e) {
          break;
        }
        console.log('res=', res)
        // 没有数据了
        if (res['comments'].length === 0) break;
        result_arr = result_arr.concat(res['comments']);
        cursor = res['cursor'];
        // TODO
        // 这里需要后续登陆了测试，测试是否能获取到下一页数据
        // 已经测试：不需要修改token
        // xsec_token = res['xsecToken'];
        await sleep(2);
      }

      // 优化数据
      let result_csv = 'comment_id,reply_comment_id,user_name,user_id,user_xsec_token,ip_location,like_count,created,content\n';
      let csv_arr: any[] = [];
      result_arr.map(r => {
        const top_comment = [
          r.id, (r.targetComment ? r.targetComment['id'] : ''),
          r['userInfo']['nickname'], r['userInfo']['userId'], r['userInfo']['xsecToken'],
          r['ipLocation'],
          r['likeCount'],
          new Date(r['createTime']).toLocaleString(),
          r['content']
        ].map(a => String(a).includes(',') ? `"${a}"` : a);
        // result_csv += top_comment.join(',');
        csv_arr.push(top_comment.join(','));
        // 如果有字评论
        if (r['subComments'] && r['subComments'].length > 0) {
          for (let i = 0; i < r['subComments'].length; i++) {
            const rs = r['subComments'][i];
            // 如果有子评论
            const sub_comment = [
              rs.id, (rs.targetComment ? rs.targetComment['id'] : ''),
              rs['userInfo']['nickname'], rs['userInfo']['userId'], rs['userInfo']['xsecToken'],
              rs['ipLocation'],
              rs['likeCount'],
              new Date(rs['createTime']).toLocaleString(),
              rs['content']
            ].map(a => String(a).includes(',') ? `"${a}"` : a).join(',');
            csv_arr.push(sub_comment);
          }
        }
      })
      result_csv += csv_arr.join('\n');
      if (download) {
        const download_res = downloadCsvData(`comments_${note_id}_${count}`, result_csv);
        return download_res['error'] ? `保存数据失败：${download_res['error']}` : `数据保存成功。条数：${result_arr.length}。文件：${download_res['link']}`;
      }
      return result_csv;
    } catch (e) {
      // @ts-ignore
      return '获取数据失败了！' + e.message;
    }
  }
}

module.exports = GetnotecommentsTool;