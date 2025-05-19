import { Avatar, Flex, Typography, Card, Button, Tooltip, Tag, message, Modal, Divider, Image, Input, Alert } from 'antd';
import { CloudDownloadOutlined, UsergroupAddOutlined, RocketOutlined, GithubFilled   } from '@ant-design/icons';
const { Text, Title, Link, Paragraph } = Typography;

import IconSvg from '../assets/icon.png';
import GzhImage from '../assets/gzh.jpg';
import { useState, useEffect } from 'react';

import PackageInfo from '../../../../package.json';
// 当前版本号
const CURRENT_VERSION = PackageInfo.version;
// 内测码
const TEST_CODE = PackageInfo.testCode;

const compareVersions = (currentVersion, remoteVersion) => {
  // 将版本号字符串按点分割为数组
  const currentParts = currentVersion.split('.').map(Number);
  const remoteParts = remoteVersion.split('.').map(Number);

  // 比较每个部分
  for (let i = 0; i < Math.max(currentParts.length, remoteParts.length); i++) {
    const currentPart = currentParts[i] || 0; // 如果当前版本号较短，补0
    const remotePart = remoteParts[i] || 0;   // 如果远程版本号较短，补0

    if (remotePart > currentPart) {
      return true; // 远程版本更高
    } else if (remotePart < currentPart) {
      return false; // 当前版本更高
    }
  }

  // 如果所有部分都相等
  return false;
}

const AboutPage = ({ dark, running, restartMcpServer }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [updateing, setUpdateing] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  // 检查版本更新
  // todo
  const checkUpdate = async () => {
    setUpdateing(true);
    const updateInfo = await AppApi.checkUpdate();
    if (!updateInfo || !updateInfo['version']) {
      messageApi.error('检查更新失败！' + (updateInfo['error'] || JSON.stringify(updateInfo)))
      return setUpdateing(false);
    }
    if (!compareVersions(CURRENT_VERSION, updateInfo['version'])) {
      messageApi.info('当前已经是最新版本！v' + CURRENT_VERSION);
      return setUpdateing(false);
    }
    messageApi.info('发现新版本：' + updateInfo['version']);
    setUpdateInfo(updateInfo);
    return setUpdateing(false);
  }

  useEffect(() => {
    setTimeout(checkUpdate, 2000);
  }, []);
  return (
    <>
      {contextHolder}
      {updateInfo && (
        <Modal
          title={`${updateInfo['title']}（${updateInfo['version']}）`}
          maskClosable={false}
          open={true}
          closable={false}
          footer={(
            <>
              <Button type='link' href={updateInfo['link']} target='_blank'>查看</Button>
              {(updateInfo['link_mac'] || updateInfo['link_win']) && (<Button type='primary' icon={<CloudDownloadOutlined />} onClick={() => {
                const IS_MAC = navigator.userAgent.toLowerCase().includes('mac');
                let download_link = updateInfo['link'];
                if (IS_MAC && updateInfo['link_mac']) download_link = updateInfo['link_mac'];
                if (!IS_MAC && updateInfo['link_win']) download_link = updateInfo['link_win'];
                window.open(download_link, '_blank');
              }}>下载更新</Button>
              )}
            </>
          )}
          >
          <pre>{updateInfo['description']}</pre>
        </Modal>
      )}
      <Card>
        <Flex gap={15}>
          <Flex vertical gap={10} align='center' justify='center'>
            <Tooltip title="点击访问官网">
              <Avatar size={64} src={IconSvg} style={{
                backgroundColor: dark ? '#222' : '#EEE',
                cursor: 'pointer'
              }} onClick={() => {
                window.open('https://xhs-mcp.aicu.icu', '_blank');
              }} />
            </Tooltip>
            <Tag size='small' bordered={false} shape='round'>v{CURRENT_VERSION}</Tag>
          </Flex>
          <Flex vertical flex={1}>
            <Flex justify='center'>
              <Title type="danger" level={5} style={{
                marginTop: 0,
                paddingTop: 0,
                flex: 1,
              }}>XHS-MCP-SERVER</Title>
              <Tooltip title="点击检查更新">
                <Button size='small' icon={<CloudDownloadOutlined />} loading={updateing} onClick={checkUpdate}>检查更新</Button>
              </Tooltip>
            </Flex>
            <Paragraph>这是一款简单、专业、高效、极速的小红书MCP服务器！<br/>
              <Text>搭配AI客户端，实现自动化智能执行各种任务！</Text>
              <ul style={{
                listStyleType: 'circle',
                marginTop: 10,
              }}>
                <li><Text code>主站服务：</Text>笔记评论数据搜索、获取、导出；收藏点赞发布评论等</li>
                <li><Text code>创作者服务：</Text>提供发布图文、视频笔记、获取笔记数据等分析工具（开发中）</li>
              </ul>
            </Paragraph>
          </Flex>
        </Flex>
      </Card>

      <Card hoverable title='关注我们' extra={(
        <Button type='link' icon={<GithubFilled />} onClick={() => {
          window.open('https://github.com/aicu-icu/xhs-mcp-server', '_blank');
        }}>GitHub</Button>
      )}>
        <Flex gap={5} vertical align='center'>
          <Image src={GzhImage} width={100} />
          <Tag>公众号：为Ai痴狂</Tag>
        </Flex>
      </Card>
    </>
  )
}

export default AboutPage;