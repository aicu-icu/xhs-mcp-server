import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";

const { httpPost, jsonToCsv, sleep, downloadCsvData } = require("../xhs-browser.js");

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

interface SearchnotesInput {
  keyword: string;
  // page: number;
  count: number;
  // pageSize: number;
  sort: string; // popularity_descending = 最热，time_descending=最新；general=综合排序
  noteType: number; // 0 = 全部，1 = 视频； 2=图文
  download: boolean;
}

class SearchnotesTool extends MCPTool<SearchnotesInput> {
  name = "搜索小红书笔记";
  description = `根据关键词，搜索相关的小红书笔记列表，可搜索分类（note_type）选项为：
0 全部类型
1 视频笔记
2 图文笔记
可对搜索结果进行排序，排序（sort）选项为以下其一：
general 综合排序
time_descending 最新排序
popularity_descending 最热排序
  `;

  schema = {
    keyword: {
      type: z.string(),
      description: "要搜索的笔记的关键词",
    },
    count: {
      type: z.number(),
      default: 20,
      description: '要获取的数据量，默认20个'
    },
    sort: {
      type: z.enum(['general', 'time_descending', 'popularity_descending']),
      default: 'general',
      description: '搜索结果排序规则'
    },
    noteType: {
      type: z.number(),
      default: 0,
      description: '搜索的笔记类型'
    },
    download: {
      type: z.boolean(),
      description: '是否下载导出数据成文件。如果用户特别指明了要下载，则为true，否则默认false',
      default: false
    }
  };

  async execute(input: SearchnotesInput) {
    const {
      keyword, count, sort, noteType, download
    } = input;
    try {
      const searchId = createSearchId();
      let loaded_count = 0;
      let current_page = 1;
      const results_all: any[] = [];
      while (loaded_count < count) {
        try {
          const res = await httpPost('/api/sns/web/v1/search/notes', {
            "keyword": keyword,
            "page": current_page,
            "page_size": 20,
            "search_id": searchId,
            "sort": sort,
            "note_type": noteType,
            "ext_flags": [],
            "filters": [
                {
                    "tags": [
                        "general"
                    ],
                    "type": "sort_type"
                },
                {
                    "tags": [
                        "不限"
                    ],
                    "type": "filter_note_type"
                },
                {
                    "tags": [
                        "不限"
                    ],
                    "type": "filter_note_time"
                },
                {
                    "tags": [
                        "不限"
                    ],
                    "type": "filter_note_range"
                },
                {
                    "tags": [
                        "不限"
                    ],
                    "type": "filter_pos_distance"
                }
            ],
            "geo": "",
            "image_formats": [
                "jpg",
                "webp",
                "avif"
            ]
          });
          // @ts-ignore
          res['items'].map((item) => {
            if (loaded_count >= count) return;
            // 过滤
            if (item['modelType'] !== 'note') return;
            results_all.push(item);
            loaded_count++;
          })
          if (loaded_count >= count) break;
          current_page ++;
          await sleep(2);
        } catch(e) {
          // @ts-ignore
          return `搜索笔记数据失败：${e.message}`;
          break;
        }
      }

      const result_csv = jsonToCsv(results_all, [
        'note_id@id',
        'xsec_token@xsecToken',
        'note_type@noteCard.type',
        'title@noteCard.displayTitle',
        'liked_count@noteCard.interactInfo.likedCount',
        'cover@noteCard.cover.urlPre',
        'user_id@noteCard.user.userId',
        'user_name@noteCard.user.nickname',
        'user_xsec_token@noteCard.user.xsecToken'
      ]);
      if (download) {
        const fileName = `search_notes_${encodeURIComponent(keyword)}_${count}_${+new Date}.csv`;
        const download_result = downloadCsvData(fileName, result_csv);
        return download_result['error'] ? `数据保存失败：${download_result['error']}` : `数据已保存。条数：${results_all.length}。文件：${download_result.link}`;
      }
      return result_csv;
    } catch(e) {
      // @ts-ignore
      return '搜索笔记数据失败：' + e.message;
    }
  }
}

module.exports = SearchnotesTool;