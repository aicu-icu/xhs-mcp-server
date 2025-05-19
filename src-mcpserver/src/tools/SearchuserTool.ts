import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";

const { httpPost, sleep, downloadCsvData, jsonToCsv } = require("../xhs-browser.js");

const createSearchId = () => {
  const F = () => {
      var timestamp = new Date().getTime().toString();
      if (timestamp.length < 13) {
        timestamp = timestamp.padEnd(13, "0");
      }
      return timestamp
  };
  const J = () => {
      var e;
      var t = BigInt(F())
        , r = BigInt(Math.ceil(2147483646 * Math.random()));
      return t <<= BigInt(64),
      (t += r).toString(36)
  };
  return J();
}

interface SearchuserInput {
  keyword: string;
  // page: number;
  // pageSize: number;
  count: number;
  download: boolean;
}

class SearchuserTool extends MCPTool<SearchuserInput> {
  name = "搜索小红书用户";
  description = "根据关键词，搜索特定的用户。返回的数据可能有多个，可以按照比如认证、粉丝数等数据给用户选择一个合适的账号。如果有多个类似结果，请提醒用户选择。返回数据中的xsec_token非常重要，可能需要带入下一次工具调用";

  schema = {
    keyword: {
      type: z.string(),
      description: '要搜索的用户名的关键字'
    },
    count: {
      type: z.number(),
      default: 5,
      description: '要获取的数据量，默认5个'
    },
    download: {
      type: z.boolean(),
      description: '是否下载导出数据成文件。如果用户特别指明了要下载，则为true，否则默认false',
      default: false
    }
    // page: {
    //   type: z.number(),
    //   default: 1,
    //   description: '要获取数据的页数，默认请传递第1页'
    // },
    // pageSize: {
    //   type: z.number().min(1).max(20),
    //   default: 1,
    //   description: '要获取的一页数据的用户数据量，默认请传递1个（1-20个）'
    // }
  };

  async execute(input: SearchuserInput) {
    const { keyword, count, download } = input;
    try {
      const searchId = createSearchId();
      let current_page = 1;
      const pageSize = 20;
      const results_all: any[] = [];
      let loaded_count = 0;

      while (loaded_count < count) {
        try {
          const res = await httpPost('/api/sns/web/v1/search/usersearch', {
            "search_user_request": {
                "keyword": keyword,
                "search_id": searchId,
                "page": current_page,
                "page_size": pageSize,
                "biz_type": "web_search_user",
                "request_id": Math.random().toString().slice(2, 11) + "-" + new Date().getTime()
            }
          })
          if (!res['result'] || !res['result']['success']) throw new Error(JSON.stringify(res['result'] || res));
          // @ts-ignore
          res['users'].map(user => {
            if (loaded_count >= count) return;
            results_all.push(user);
            loaded_count ++;
          });
          if (loaded_count >= count) break;
          current_page += 1;
          await sleep(2);
        } catch(e) {
          // @ts-ignore
          return '搜索用户数据失败：' + e.message;
        }
      }

      // const dataKeys = [
      //   'id', 'image', 'avatar', 'xsecToken', 
      //   'profession', 'subTitle',
      //   'fans', 'noteCount', 'updateTime',
      // ];
      const result_csv = jsonToCsv(results_all, [
        'user_id@id',
        'xsec_token@xsecToken',
        'avatar@avatar',
        'image@image',
        'profession@profession',
        'sub_title@subTitle',
        'fans@fans',
        'note_count@noteCount',
        'updateTime@updateTime'
      ]);
      if (download) {
        const fileName = `search_users_${encodeURIComponent(keyword)}_${count}_${+new Date}.csv`;
        const download_result = downloadCsvData(fileName, result_csv);
        return download_result['error'] ? `数据保存失败：${download_result['error']}` : `数据已保存。条数：${results_all.length}。文件：${download_result.link}`;
      }
      return result_csv;
    } catch(e) {
      // @ts-ignore
      return '搜索用户数据失败：' + e.message;
    }
  }
}

module.exports = SearchuserTool;