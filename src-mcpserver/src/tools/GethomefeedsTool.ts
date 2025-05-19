import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";
const { httpPost, downloadCsvData, sleep, jsonToCsv } = require("../xhs-browser.js");

interface GethomefeedsInput {
  count: number;
  category: string;
  download: boolean;
}

class GethomefeedsTool extends MCPTool<GethomefeedsInput> {
  name = "获取推荐笔记列表";
  description = `获取小红书网站首页的帖子列表。
分类数据如下（csv格式）：
id,name
homefeed_recommend,推荐
homefeed.fashion_v3,穿搭
homefeed.food_v3,美食
homefeed.cosmetics_v3,彩妆
homefeed.movie_and_tv_v3,影视
homefeed.career_v3,职场
homefeed.love_v3,情感
homefeed.household_product_v3,家居
homefeed.gaming_v3,游戏
homefeed.travel_v3,旅行
homefeed.fitness_v3,健身

返回结果（csv，type数据：normal=图文，video=视频）：
note_id,xsec_token,type,title,liked_count,cover,user_id,user_name,user_xsec_token

工具的参数都请传递，默认参数为：count=10,category=homefeed_recommend,download=false`;

  schema = {
    count: {
      type: z.number(),
      default: 10,
      description: '要获取的数据量，默认10个'
    },
    category: {
      type: z.string(),
      description: '帖子的分类id，默认是推荐分类',
      default: 'homefeed_recommend'
    },
    download: {
      type: z.boolean(),
      description: '是否下载导出数据成文件。如果用户特别指明了要下载，则为true，否则默认false',
      default: false
    }
  };

  async execute(input: GethomefeedsInput) {
    const { count, category, download } = input;

    try {
      let cursor_score = '';
      let note_index = 0;
      // 总共获取了多少
      let loaded_count = 0;
      // 结果缓存
      let results_all: any[] = [];
      while (loaded_count < count) {
        try {
          const res = await httpPost("/api/sns/web/v1/homefeed", {
            "cursor_score": cursor_score,
            "num": 27,
            "refresh_type": 1,
            "note_index": note_index,
            "unread_begin_note_id": "",
            "unread_end_note_id": "",
            "unread_note_count": 0,
            "category": category,
            "search_key": "",
            "need_num": 12,
            "image_formats": [
              "jpg",
              "webp",
              "avif"
            ],
            "need_filter_image": false
          });
          res['items'].map((item: Array<any>) => {
            if (loaded_count >= count) return;
            results_all.push(item);
            loaded_count++;
          })
          if (loaded_count >= count) break;
          cursor_score = res['cursor_score'];
          note_index = res['items'].length;
          await sleep(2);
        } catch (e) {
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
        const fileName = `${category}_${count}_${+new Date}.csv`;
        const download_result = downloadCsvData(fileName, result_csv);
        return download_result['error'] ? `数据保存失败：${download_result['error']}` : `数据已保存。条数：${results_all.length}。文件：${download_result.link}`;
      }
      return result_csv;
    } catch (e: any) {
      return '获取数据列表失败了！错误信息：' + e.message;
    }
  }
}

module.exports = GethomefeedsTool;