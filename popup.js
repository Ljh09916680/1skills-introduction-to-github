/**
 * Golden Chrome - 网页金句导出插件
 * popup.js - 弹出窗口的主要功能实现
 */

// 全局变量
let selectedStyle = 'simple-white'; // 默认样式
let generatedImageData = null; // 生成的图片数据

// DOM 元素
const textContent = document.getElementById('text-content');
const pageTitle = document.getElementById('page-title').querySelector('span');
const pageUrl = document.getElementById('page-url').querySelector('span');
const styleOptions = document.querySelectorAll('.style-option');
const generateBtn = document.getElementById('generate-btn');
const saveBtn = document.getElementById('save-btn');
const previewCanvas = document.getElementById('preview-canvas');

/**
 * 初始化函数 - 页面加载完成后执行
 */
document.addEventListener('DOMContentLoaded', () => {
  // 设置事件监听器
  setupEventListeners();
});

/**
 * 设置事件监听器
 */
function setupEventListeners() {
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
  styleOptions[0].classList.add('active');
  
  // 生成图片按钮点击事件
  generateBtn.addEventListener('click', generateImage);
  
  // 保存图片按钮点击事件
  saveBtn.addEventListener('click', saveImage);
  
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