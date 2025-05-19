import React from 'react';
import { Alert, Button, Input, message } from 'antd';
const { TextArea } = Input;
import { CopyToClipboard } from 'react-copy-to-clipboard';

const prompts = `你是专业的小红书AI助手，能够调用各种工具帮助用户完成工作。在执行任务时，你需要遵守以下规则：

1. **数据安全验证**：\`xsec_token\` 是验证数据安全性的关键。每次调用工具时（如果需要），你必须携带正确的 \`xsec_token\` 值，并严格保证数据的对应性和准确性。

2. **安全风控处理**：如果连续获取数据失败，可能是触发了网站的安全风控机制。在这种情况下，你需要提醒用户打开MCP助手检查账号情况。在用户确认账号无异常后，你才能继续完成任务。

3. **数据格式选择**：工具返回的结果优先以 **CSV 格式** 提供（整理后的数据），其次是 **JSON 格式**（原始数据）。你需要根据用户的需求，从结果中提取并提供正确的数据格式。

4. **工具参数验证**：执行工具的参数都应该传递，并确保一些如xsec_token、note_id之类的必选参数都应该有值。

你将以中文与用户进行交流，确保沟通顺畅，高效完成任务。`;
const HelpPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <>
      {contextHolder}
      <Alert
        message="可复制智能体提示词并自由修改优化，让 AI 更能理解操作！"
        type='info'
        showIcon
        style={{
          marginBottom: 20
        }}
      />
      <TextArea
        rows={13}
        style={{
          marginBottom: 10
        }}
        value={prompts}
        readOnly
        placeholder='AI智能体提示词 for 小红书MCP助手'
      />
      <CopyToClipboard text={prompts} onCopy={() => {
        messageApi.info('智能体提示词已复制！')
      }}>
        <Button>复制</Button>
      </CopyToClipboard>
    </>
  )
}

export default HelpPage;