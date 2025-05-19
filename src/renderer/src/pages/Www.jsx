import React, { useState, useEffect } from 'react';
import { Flex, Divider, Alert, Button, message, Avatar } from 'antd';
import { CaretRightFilled, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Select, Typography, InputNumber, Space, Input, Card, Tooltip, Badge } from 'antd';
const { Text, Link } = Typography;
import { CopyToClipboard } from 'react-copy-to-clipboard';

import McpToolsPage from './McpTools';

const Home = ({ xhsUser, setXhsUser, dark }) => {
  const [messageApi, contextHolder] = message.useMessage();
  // 启动服务状态
  const [starting, setStarting] = useState(false);
  // 服务运行状态
  const [running, setRunning] = useState(false);
  // 端口
  const [port, setPort] = useState(parseInt(localStorage.getItem('config.port')) || 9999);
  // 路由
  const [endpoint, setEndpoint] = useState(localStorage.getItem('config.endpoint') || '/mcp');
  // 协议 shttp, sse
  const [proto, setProto] = useState(localStorage.getItem('config.proto') || 'sse');

  // 数据导出目录
  const [savePath, setSavePath] = useState(localStorage.getItem('config.savepath') || '');

  // mcp工具列表

  const [mcpTools, setMcpTools] = useState([]);

  const [isTest, setIsTest] = useState(!!localStorage.getItem('isTest'));
  const selectSavePath = async () => {
    if (typeof AppApi === 'undefined') {
      messageApi.error('未初始化API！')
      return console.error('未初始化AppApi');
    }
    const res = await AppApi.selectSavePath();
    if (res) {
      setSavePath(res);
      // 保存到缓存
      localStorage.setItem('config.savepath', res);
    }
  }
  // 只执行一次
  useEffect(() => {
    if (savePath == '') {
      AppApi.getDownloadPath().then(p => {
        setSavePath(p);
      });
    }
    getXhsUser();
  }, []);
  AppApi.getJoinedTest().then(r => {
    setIsTest(r);
  })

  // 获取xhs登陆用户
  // const [xhsUser, setXhsUser] = useState(null);
  const getXhsUser = async () => {
    if (typeof AppApi === 'undefined') {
      messageApi.error('未初始化API！')
      return console.error('未初始化AppApi');
    }
    const x = await AppApi.getXhsUserInfo();
    if (x) {
      console.log('xhsUser', x);
      setXhsUser(x);
      // 如果没有登陆，循环直到登陆成功
      // if (x.guest && running) return setTimeout(getXhsUser, 2000);
    }
    // if (x) {
    //   messageApi.success('已获取到小红书登陆用户：' + xhsUser);
    // } else {
    //   messageApi.warning('未获取到小红书登陆用户');
    // }
  }
  // get user
  // getXhsUser();

  // 获取mcp工具列表
  const getMcpTools = async () => {
    const tools = await AppApi.getMcpServerTools();
    console.log('mcptools:', tools)
    setMcpTools(tools);
  };

  // 启动/停止mcp服务
  const toggleServer = async (skipStop = false) => {
    if (typeof AppApi === 'undefined') {
      messageApi.error('未初始化API！')
      return console.error('未初始化AppApi');
    }
    if (!port || !endpoint) return messageApi.error('请先配置MCP端口和路由！');
    if (!savePath) return messageApi.error('请配置数据导出目录！');
    if (!endpoint.startsWith('/')) setEndpoint(`/${endpoint}`);
    setStarting(true);
    if (running && !skipStop) {
      try {
        const msg = await AppApi.stopMcpServer();
        messageApi.info(msg);
        setRunning(false);
        setStarting(false);
      } catch (err) {
        messageApi.warning(err);
        setStarting(false);
      }
      // AppApi.stopMcpServer().then(msg => {
      //   messageApi.info(msg);
      //   setRunning(false);
      //   setStarting(false);
      // }).catch(err => {
      //   messageApi.warning(err);
      //   setStarting(false);
      // })
    } else {
      try {
        const msg = await AppApi.startMcpServer({
          proto, port, endpoint, savePath
        });
        messageApi.success(msg);
        setRunning(true);
        setStarting(false);
        // 
        // get user
        getXhsUser();
        // 
        getMcpTools();
      } catch (err) {
        messageApi.warning(err);
        setStarting(false);
        setRunning(false);
      }
      // 存储配置到本地
      localStorage.setItem('config.port', port);
      localStorage.setItem('config.proto', proto);
      localStorage.setItem('config.endpoint', endpoint);
    }
  }

  const MCP_SERVER_LINK = `http://127.0.0.1:${port}${endpoint}`;
  return (
    <>
      {contextHolder}
      <Flex gap='middle' vertical>
        <Card title='⚙ 服务配置' loading={starting} hoverable extra={
          <>
            {xhsUser && (
              <Tooltip title='打开小红书WEB'>
                <Button
                  size='small'
                  shape='round'
                  color={xhsUser.guest ? 'danger' : 'cyan'}
                  variant='solid'
                  onClick={() => {
                    window['AppApi'].toggleXhsBrowser();
                  }}
                  icon={xhsUser.guest ? <UserOutlined /> : <Avatar crossOrigin='anonymous' src={xhsUser.images || xhsUser.imageb} size={18} />}
                >{xhsUser.guest ? '登陆小红书' : `已登陆（${xhsUser.nickname}）`}</Button>
              </Tooltip>
            )}
            {xhsUser && <Divider type='vertical' />}
          <Tooltip title={running ? '点击停止MCP服务' : '点击启动MCP服务'}>
            <Button onClick={() => toggleServer(false)} loading={starting} color={running ? 'danger' : 'primary'} variant='solid' shape='circle' icon={running ? <CloseOutlined /> : <CaretRightFilled />}></Button>
          </Tooltip>
          </>
        } styles={{
          body: {
            padding: 0
          }
        }}>
          <Alert banner message={(
            <>
              <Text>
                主站MCP服务{running ? '已' : '未'}启动
              </Text>
              {running && <Divider type='vertical' />}
              {running && (
                <Link>{MCP_SERVER_LINK}</Link>
              )}
            </>
          )} type={running ? 'success' : 'warning'} showIcon action={
            running && (
              <>
                {/* <Tooltip title='一键配置到Cherry Studio（测试版）'>
                  <Button disabled={!isTest} size='small' variant='filled' color='pink' onClick={() => {
                    const mcpJson = {
                      mcpServers: {
                        'xhs-mcp-server': {
                          name: 'xhs-mcp-server',
                          type: proto,
                          description: 'XiaoHongShu MCP-SERVER | aicu.icu',
                          isActive: true,
                          baseUrl: MCP_SERVER_LINK
                        }
                      }
                    };
                    const mcpJsonStr = JSON.stringify(mcpJson);
                    // --- 暂时关闭跳转cherry studio
                    console.log(mcpJsonStr)
                    const mcpJsonStrBase64 = btoa(mcpJsonStr);
                    const uri = `cherrystudio://mcp/install?servers=${mcpJsonStrBase64}`;
                    console.log(uri);
                    window.open(uri, '_blank');
                  }}>一键配置</Button>
                </Tooltip> */}
                <Divider type='vertical' />
                <CopyToClipboard text={MCP_SERVER_LINK} onCopy={(text, success) => {
                  messageApi.info(success ? 'MCP服务地址复制成功！' : '复制失败了！');
                }}>
                  <Tooltip title="复制MCP地址">
                    <Button size='small' variant='filled' color='primary'>复制</Button>
                  </Tooltip>
                </CopyToClipboard>
              </>
              )
          } />
          <Space style={{
            padding: 20
          }}>
            <Tooltip title='MCP服务协议'>
              <Select
                disabled={running}
                defaultValue={proto}
                placeholder="请选择服务协议"
                style={{ width: 200 }}
                onChange={setProto}
                options={[
                  { value: 'shttp', label: 'Streamable HTTP' },
                  { value: 'sse', label: 'SSE' }
                ]}
              />
            </Tooltip>
            <Tooltip title='服务监听端口（1000-65535）'>
              <InputNumber placeholder='服务端口' disabled={running} min={1000} max={65535} defaultValue={port} onChange={setPort} />
            </Tooltip>
            <Tooltip title='服务端点路由'>
              <Input placeholder='端点路由' disabled={running} value={endpoint} onChange={e => {
                setEndpoint(e.target.value)
              }} />
            </Tooltip>
          </Space>
          <Space style={{
            padding: 20,
            paddingTop: 0
          }}>
            <Text>请设置数据存储目录：</Text>
            <Tooltip title='数据导出存储目录'>
              <Input placeholder='数据导出存储目录' value={savePath} readOnly style={{
                width: 245
              }} />
            </Tooltip>
            <Button onClick={selectSavePath} disabled={running}>选择目录</Button>
          </Space>
        </Card>
        <Card hoverable title={(
          <Badge count={mcpTools.length} size='small' offset={[18, 7]} color='cyan'>🛠 工具列表</Badge>
        )}>
          <McpToolsPage mcpTools={mcpTools} setMcpTools={setMcpTools} />
        </Card>
      </Flex>
    </>
  )
}

export default Home;