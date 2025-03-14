/**
 * Golden Chrome - 网页金句导出插件
 * content.js - 内容脚本，用于在网页中捕获用户选择的文本
 */

// 全局变量
let selectedText = ''; // 用户选中的文本
let selectionButton = null; // 悬浮操作按钮

/**
 * 初始化函数 - 设置事件监听器
 */
function initialize() {
  // 监听文本选择事件
  document.addEventListener('mouseup', handleTextSelection);
  
  // 创建悬浮操作按钮
  createSelectionButton();
  
  // 监听来自popup的消息
  chrome.runtime.onMessage.addListener(handleMessage);

  // 添加关闭弹窗的功能
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
}

/**
 * 创建悬浮操作按钮
 */
function createSelectionButton() {
  // 如果按钮已存在，则返回
  if (selectionButton) return;
  
  // 创建按钮元素
  selectionButton = document.createElement('div');
  selectionButton.className = 'golden-chrome-selection-button';
  selectionButton.innerHTML = '<span>导出金句</span>';
  selectionButton.style.display = 'none';
  
  // 添加点击事件
  selectionButton.addEventListener('click', handleButtonClick);
  
  // 将按钮添加到页面
  document.body.appendChild(selectionButton);
}

/**
 * 处理文本选择事件
 * @param {MouseEvent} event - 鼠标事件对象
 */
function handleTextSelection(event) {
  // 获取选中的文本
  const selection = window.getSelection();
  selectedText = selection.toString().trim();
  
  // 如果有选中文本，则显示操作按钮
  if (selectedText) {
    // 获取选中区域的位置
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 设置按钮位置 - 显示在选中文本的右上方
    const buttonTop = rect.top + window.scrollY - 40;
    const buttonLeft = rect.right + window.scrollX;
    
    // 更新按钮位置并显示
    selectionButton.style.top = `${buttonTop}px`;
    selectionButton.style.left = `${buttonLeft}px`;
    selectionButton.style.display = 'block';
  } else {
    // 如果没有选中文本，则隐藏按钮
    selectionButton.style.display = 'none';
  }
}

/**
 * 处理按钮点击事件
 */
function handleButtonClick() {
  // 在演示环境中直接显示弹出窗口
  const popup = document.querySelector('.popup-container');
  const overlay = document.querySelector('.overlay');
  
  if (popup && overlay) {
    const textContent = document.getElementById('text-content');
    if (textContent) {
      textContent.value = selectedText;
    }
    
    popup.style.display = 'block';
    overlay.style.display = 'block';
  }
  
  // 隐藏按钮
  selectionButton.style.display = 'none';
}

/**
 * 处理来自popup的消息
 */
function handleMessage(request, sender, sendResponse) {
  // 在演示环境中不需要处理消息
  return true;
}

// 初始化内容脚本
initialize();