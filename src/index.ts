/**
 * Shopify历史订单插件 - 主入口文件
 * 这是插件的入口点，负责启动插件功能
 */
import { initializePlugin } from './plugin/initializer';

/**
 * 当DOM加载完成时初始化插件
 */
document.addEventListener("DOMContentLoaded", () => {
  // 初始化插件
  initializePlugin();
});

/**
 * 类型声明 - 扩展全局Window接口
 */
declare global {
  interface Window {
    UIExtensionPointSimpleMgr?: {
      extend: (
        name: string,
        callback: (container: HTMLElement) => HTMLElement
      ) => void;
    };
  }
}

// 导出版本信息
export const VERSION = '1.0.0';
