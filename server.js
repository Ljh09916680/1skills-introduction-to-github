const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DEEPSEEK_API_KEY = 'b40891f4-6885-413c-96be-baac77afa115';

// 处理AI总结请求
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'ep-20250313200541-8djp4',
        messages: [
          {
            role: 'system',
            content: '使用一个金句总结全文最核心的内容'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.6,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        timeout: 60000 // 60秒超时
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('无效的API响应');
    }

    res.json({ summary: response.data.choices[0].message.content });
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    res.status(500).json({ error: '生成总结时出错，请稍后重试' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});