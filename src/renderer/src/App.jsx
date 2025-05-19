import React, { useState } from 'react';
import { AppstoreAddOutlined, DatabaseFilled, HeartTwoTone, MoonFilled, SunFilled, BookOutlined } from '@ant-design/icons';
import { Tabs, Switch, Space, Divider, Button, Tooltip } from 'antd';

import AboutPage from './pages/Home'
import Home from './pages/Www'
// import Logger from './pages/Logger'
// import HelpPage from './pages/Help';
// import PromptPage from './pages/Prompt';
// import McpToolsPage from './pages/McpTools';
import CreatorPage from './pages/Creator';

const App = ({ dark, setDark }) => {
  const [xhsUser, setXhsUser] = useState(null);
  // const openXhsBrowser = () => {
  //   window['AppApi'].toggleXhsBrowser();
  // }
  // const [mcpTools, setMcpTools] = useState([]);
  return (
    <Tabs
      defaultActiveKey='about'
      type='card'
      items={[
        {
          key: 'about',
          label: '关于',
          icon: <HeartTwoTone />,
          children: <AboutPage xhsUser={xhsUser} setXhsUser={setXhsUser} dark={dark} />
        },
        {
          key: 'www',
          label: '主站服务',
          icon: <DatabaseFilled />,
          children: <Home xhsUser={xhsUser} setXhsUser={setXhsUser} dark={dark} />
        },
        {
          key: 'creator',
          label: '创作者服务（开发中）',
          disabled: true, // 开发中
          icon: <AppstoreAddOutlined />,
          children: <CreatorPage xhsUser={xhsUser} setXhsUser={setXhsUser} dark={dark} />
        },
        // mcpTools.length > 0 && {
        //   key: 'mcp-tools',
        //   label: <Badge count={mcpTools.length} size='small' offset={[15, -5]} color='cyan'>工具</Badge>,
        //   icon: <ToolOutlined />,
        //   children: <McpToolsPage mcpTools={mcpTools} setMcpTools={setMcpTools} />
        // },
        // {
        //   key: 'help',
        //   label: '教程',
        //   icon: <BookOutlined />,
        //   children: <HelpPage />
        // },
        // {
        //   key: 'prompt',
        //   label: '提示词',
        //   icon: <RobotOutlined />,
        //   children: <PromptPage />
        // }
        // {
        //   key: 'logger',
        //   label: '日志',
        //   icon: <FileTextTwoTone />,
        //   children: <Logger />
        // }
      ]}
      tabBarExtraContent={{
        right: (
          <Space>
            {/* 查看教程 */}
            <Tooltip title='查看使用文档、实战教程等'>
              <Button icon={<BookOutlined />} type='link' href='https://xhs-mcp.aicu.icu/guides/usage/' target='_blank'>使用教程</Button>
            </Tooltip>
            <Divider type='vertical' />
            <Tooltip title={`切换${dark ? '日间' : '夜间'}模式`}>
              <Switch
                checkedChildren={<MoonFilled />}
                unCheckedChildren={<SunFilled />}
                checked={dark}
                onChange={setDark}
              />
            </Tooltip>
          </Space>
        )
      }}
    />
  )
}
export default App;