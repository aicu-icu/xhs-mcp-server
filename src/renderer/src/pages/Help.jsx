import React from 'react';
import { Collapse, Alert, Button, Divider, Image } from 'antd';

import GzhImage from '../assets/gzh.jpg';
const docs = [
  {
    label: '🔍 公众号：为Ai痴狂',
    children: (
      <Image src={GzhImage} width={100} style={{
        borderRadius: 5
      }} />
    )
  },
  {
    label: '⚙️ 通用配置',
    children: (
      <p>小红书MCP服务器支持SSE、StreamableHTTP两种服务类型。启动了服务后复制服务地址，即可在其他支持MCP的AI客户端中使用。</p>
    )
  },
  {
    label: '⚙️ 在 Cherry Studio 中使用', children: (
      <ul>
        <li>1. 启动MCP服务，复制MCP服务地址</li>
        <li>2. 进入Cherry Studio设置</li>
        <li>3. 选择MCP服务器，添加服务器</li>
        <li>4. 输入MCP服务器地址以及其他信息，保存</li>
        <li>5. 在聊天窗口中，勾选MCP服务器，即可！</li>
      </ul>
    )
  },
];
docs.map((d, i) => d['key'] = `doc_${i + 1}`);

const uses = [
  {
    label: '🎓 案例：导出笔记列表',
    children: '导出100条穿搭分类笔记'
  }, {
    label: '🎓 案例：导出特定用户笔记数据',
    children: '获取雷军发布的所有笔记，并导出'
  }, {
    label: '🎓 案例：分析总结评论区',
    children: '分析这篇笔记的评论区，给我总结摘要。笔记地址：https://xxxx'
  }, {
    label: '🎓 案例：参考笔记编写文案',
    children: '请参考这篇笔记：https://笔记地址。 按照作者的风格，编写一篇关于“小红书AI助手”的相关文案。'
  }
];
uses.map((u, i) => u['key'] = `use_${i + 1}`);

const HelpPage = () => {
  return (
    <>
      <Alert
        message="这里精选了部分优秀的AI客户端配置教程以及使用技巧。"
        type='info'
        showIcon
        action={(
          <Button size='small' type='primary' onClick={() => {
            window.open('https://xhs-mcp.aicu.icu/', '_blank');
          }}>更多教程 👉</Button>
        )}
        style={{
          marginBottom: 20
        }}
      />

      <Collapse
        items={docs}
        defaultActiveKey={['doc_1']}
      />
      <Divider plain>使用案例参考</Divider>
      <Collapse
        items={uses}
      />
      <Divider />
    </>
  )
}

export default HelpPage;