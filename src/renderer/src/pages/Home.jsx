import React, { useState, useEffect } from 'react';
import { Flex, Divider, Alert, Button, message } from 'antd';
import { CaretRightFilled, CloseOutlined } from '@ant-design/icons';
import { Select, Typography, InputNumber, Space, Input, Card, Tooltip } from 'antd';
const { Text, Link } = Typography;
import { CopyToClipboard } from 'react-copy-to-clipboard';


import AboutPage from '../components/About';

const Home = ({ xhsUser, setXhsUser, dark, mcpTools, setMcpTools }) => {
  return (
    <Flex gap='middle' vertical>
      <AboutPage dark={dark} />
    </Flex>
  )
}

export default Home;