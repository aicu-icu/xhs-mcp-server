import { MCPTool } from "@aicu/mcp-framework";
import { z } from "zod";

const {
  httpPost
} = require('../xhs-browser');

interface GetfeeddataInput {
  note_id: string;
  xsec_token: string;
}

class GetfeeddataTool extends MCPTool<GetfeeddataInput> {
  name = "获取笔记详情";
  description = "获取指定笔记的详细数据，note_id和xsec_token都是必填项";

  schema = {
    note_id: {
      type: z.string(),
      description: "笔记的note_id",
    },
    xsec_token: {
      type: z.string(),
      description: "笔记对应的xsec_token",
    },
  };

  async execute(input: GetfeeddataInput) {
    const { note_id, xsec_token } = input;
    try {
      const res = await httpPost("/api/sns/web/v1/feed", {
        "source_note_id": note_id,
        "image_formats": [
          "jpg",
          "webp",
          "avif"
        ],
        "extra": {
          "need_body_topic": "1"
        },
        "xsec_source": "pc_feed",
        "xsec_token": xsec_token
      });
      // 格式化数据
      const note = res['items'][0];
      const noteData = {
        note_id: note['id'],
        title: note['noteCard']['title'],
        desc: note['noteCard']['desc'],
        type: note['noteCard']['type'],
        user: note['noteCard']['user'],
        time: new Date(note['noteCard']['time']).toString(),
        counts: {
          collected: note['noteCard']['interactInfo']['collectedCount'],
          liked: note['noteCard']['interactInfo']['likedCount'],
          comment: note['noteCard']['interactInfo']['commentCount'],
          share: note['noteCard']['interactInfo']['shareCount']
        },
        images: [],
        video: {}
      }
      if (note['noteCard']['imageList']) {
        // @ts-ignore
        noteData['images'] = note['noteCard']['imageList'].map(i => i['urlDefault']);
      }
      if (note['noteCard']['video']) {
        let v = null;
        for (const key in note['noteCard']['video']['media']['stream']) {
          const vv = note['noteCard']['video']['media']['stream'][key];
          if (vv.length > 0) v = vv[0];
        };
        if (v) {
          noteData['video'] = {
            duration: note['noteCard']['video']['capa']['duration'],
            url: v['masterUrl']
          }
        }
      }
      // 转换成csv
      return JSON.stringify(noteData);
    } catch (e) {
      // @ts-ignore
      return '获取笔记数据失败了！' + e.message;
    }
  }
}

module.exports = GetfeeddataTool;