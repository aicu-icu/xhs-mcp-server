import React from 'react';
import { Collapse, Tag, Table, Empty, Badge } from 'antd';

import GzhImage from '../assets/gzh.jpg';


const McpToolsPage = ({ mcpTools }) => {
  const tools = mcpTools.map((tool, key) => ({
    key: `tool_${key}`,
    label: <Badge status={tool.isTest ? 'processing' : 'success'} text={tool.name} />,
    extra: tool.isTest ? <Tag color='cyan' bordered={false}>内测版</Tag> : null,
    children: (
      <>
        <pre style={{
          whiteSpace: 'pre-wrap'
        }}>
          {tool.description}
        </pre>
        <Table
          columns={[
            {
              key: 'name',
              title: '参数名称',
              dataIndex: 'name'
            }, {
              key: 'type',
              title: '参数类型',
              dataIndex: 'type'
            }, {
              key: 'default',
              title: '默认值',
              dataIndex: 'default'
            }, {
              key: 'desc',
              title: '参数说明',
              dataIndex: 'desc'
            }
          ]}
          dataSource={Object.keys(tool.schema).map((name, idx) => ({
            key: `param_${idx}`,
            name,
            type: tool.schema[name].type['_def']['typeName'].replace('Zod', ''),
            desc: tool.schema[name].description,
            default: tool.schema[name].default || '-'
          }))}
          pagination={false}
        ></Table>
      </>
    )
  }))
  return (
    <>
      {/* <Alert
        message="这里精选了部分优秀的AI客户端配置教程以及使用技巧。"
        type='info'
        showIcon
        style={{
          marginBottom: 15
        }}
      /> */}
      {tools.length === 0 && (
        <Empty description="请先开启MCP服务" styles={{
          image: {
            height: 70
          }
        }}/>
      )}

      {tools.length > 0 && (

        <Collapse
          size='small'
          items={tools}
        />
      )}
      {/* <Divider plain>当前可用 {mcpTools.length} 个工具</Divider> */}
    </>
  )
}

export default McpToolsPage;