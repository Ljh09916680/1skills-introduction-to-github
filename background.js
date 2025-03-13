/**
 * Golden Chrome - 网页金句导出插件
 * background.js - 后台服务工作线程，处理扩展的后台任务
 */

/**
 * 监听来自内容脚本的消息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理打开弹出窗口的请求
  if (request.action === 'openPopup') {
    // 存储选中的文本到本地存储
    chrome.storage.local.set({ selectedText: request.selectedText }, () => {
      // 打开扩展的弹出窗口
      chrome.action.openPopup();
    });
  }
  
  return true; // 保持消息通道开放，支持异步响应
});

/**
 * 监听扩展安装事件
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装时显示欢迎页面或设置初始配置
    console.log('Golden Chrome 扩展已安装');
    
    // 初始化存储数据
    chrome.storage.local.set({
      selectedStyle: 'simple-white', // 默认样式
      recentTexts: [] // 最近使用的文本
    });
  }
});