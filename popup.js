/**
 * Golden Chrome - 网页金句导出插件
 * popup.js - 弹出窗口的主要功能实现
 */

// 全局变量
let selectedStyle = 'simple-white'; // 默认样式
let generatedImageData = null; // 生成的图片数据

// DOM 元素
let textContent, pageTitle, pageUrl, styleOptions, generateBtn, saveBtn, previewCanvas, aiSummarizeBtn;

/**
 * 初始化函数 - 页面加载完成后执行
 */
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  textContent = document.getElementById('text-content');
  pageTitle = document.getElementById('page-title').querySelector('span');
  pageUrl = document.getElementById('page-url').querySelector('span');
  styleOptions = document.querySelectorAll('.style-option');
  generateBtn = document.getElementById('generate-btn');
  saveBtn = document.getElementById('save-btn');
  previewCanvas = document.getElementById('preview-canvas');
  aiSummarizeBtn = document.getElementById('ai-summarize-btn');
  
  // 设置事件监听器
  setupEventListeners();
});

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 检查所有必需的DOM元素是否存在
  if (!textContent || !pageTitle || !pageUrl || !styleOptions || !generateBtn || !saveBtn || !previewCanvas || !aiSummarizeBtn) {
    console.error('无法找到必需的DOM元素');
    return;
  }

  // 关闭按钮事件
  const closeButton = document.querySelector('.close-popup');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      const popup = document.querySelector('.popup-container');
      const overlay = document.querySelector('.overlay');
      if (popup && overlay) {
        popup.style.display = 'none';
        overlay.style.display = 'none';
      }
    });
  }

  // 样式选择事件
  styleOptions.forEach(option => {
    option.addEventListener('click', () => {
      // 移除所有选项的active类
      styleOptions.forEach(opt => opt.classList.remove('active'));
      
      // 为当前选项添加active类
      option.classList.add('active');
      
      // 更新选中的样式
      selectedStyle = option.getAttribute('data-style');
    });
  });
  
  // 默认选中第一个样式
  if (styleOptions.length > 0) {
    styleOptions[0].classList.add('active');
  }
  
  // 生成图片按钮点击事件
  generateBtn.addEventListener('click', generateImage);
  
  // 保存图片按钮点击事件
  saveBtn.addEventListener('click', saveImage);
  
  // AI总结按钮点击事件
  aiSummarizeBtn.addEventListener('click', handleAISummarize);
  
  // 文本内容变化事件
  textContent.addEventListener('input', () => {
    // 如果已经生成过图片，则禁用保存按钮
    if (generatedImageData) {
      saveBtn.disabled = true;
      generatedImageData = null;
      previewCanvas.style.display = 'none';
    }
  });
}

/**
 * 处理AI总结请求
 */
async function handleAISummarize() {
  const text = textContent.value.trim();
  
  if (!text) {
    alert('请输入要总结的文字内容');
    return;
  }
  
  // 禁用按钮并显示加载状态
  aiSummarizeBtn.disabled = true;
  aiSummarizeBtn.textContent = '正在总结...';
  
  try {
    const response = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      throw new Error('API请求失败');
    }
    
    const data = await response.json();
    textContent.value = data.summary;
  } catch (error) {
    console.error('AI总结失败:', error);
    alert('生成总结时出错，请稍后重试');
  } finally {
    // 恢复按钮状态
    aiSummarizeBtn.disabled = false;
    aiSummarizeBtn.textContent = 'AI总结';
  }
}

/**
 * 生成图片
 */
function generateImage() {
  const text = textContent.value.trim();
  
  // 检查文本是否为空
  if (!text) {
    alert('请输入要转换的文字内容');
    return;
  }
  
  // 获取Canvas上下文
  const ctx = previewCanvas.getContext('2d');
  const width = 800;
  const height = 400;
  
  // 设置Canvas尺寸
  previewCanvas.width = width;
  previewCanvas.height = height;
  
  // 清空Canvas
  ctx.clearRect(0, 0, width, height);
  
  // 根据选中的样式设置背景
  switch (selectedStyle) {
    case 'simple-white':
      // 简约白样式
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      ctx.fillStyle = '#333333';
      break;
      
    case 'dark-black':
      // 暗夜黑样式
      ctx.fillStyle = '#222222';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      break;
      
    case 'gradient-pink':
      // 渐变粉样式
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#ff9a9e');
      gradient.addColorStop(1, '#fad0c4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      break;
  }
  
  // 设置文字样式
  ctx.font = '24px Microsoft YaHei';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 文本换行处理
  const maxWidth = width - 80;
  const lineHeight = 36;
  const lines = getTextLines(text, maxWidth, ctx);
  
  // 计算文本总高度
  const textHeight = lines.length * lineHeight;
  
  // 绘制文本
  const startY = (height - textHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
  
  // 绘制来源信息
  ctx.font = '12px Microsoft YaHei';
  ctx.textAlign = 'right';
  ctx.fillText(`来源：${pageTitle.textContent}`, width - 20, height - 20);
  
  // 显示Canvas并启用保存按钮
  previewCanvas.style.display = 'block';
  saveBtn.disabled = false;
  
  // 保存生成的图片数据
  generatedImageData = previewCanvas.toDataURL('image/png');
}

/**
 * 文本换行处理
 * @param {string} text - 需要绘制的文本
 * @param {number} maxWidth - 每行最大宽度
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @returns {string[]} 处理后的文本行数组
 */
function getTextLines(text, maxWidth, ctx) {
  const lines = [];
  let currentLine = '';
  
  // 按空格分割文本（中文不受影响）
  const words = text.split('');
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  lines.push(currentLine);
  return lines;
}

/**
 * 保存图片
 */
function saveImage() {
  if (!generatedImageData) return;
  
  // 创建下载链接
  const link = document.createElement('a');
  link.download = '金句图片.png';
  link.href = generatedImageData;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}