/**
 * Shopify历史订单插件 - 主文件
 * 负责初始化和组装各个模块
 */
import { StateManager, DOMUtils } from './Services/Core.js';
import { LinkManager, EventHandler } from './Services/OrderService.js';

/**
 * 主应用模块
 */
const ShopifyHistoricalOrders = {
  // 初始化UI扩展点
  initUIExtension() {
    if (window.UIExtensionPointSimpleMgr) {
      // 订单历史页面的 Tab 切换组件
      window.UIExtensionPointSimpleMgr.extend('order-history-tabs', () => {
        // 创建 Tab 切换组件
        const container = DOMUtils.createTabComponent();

        // 初始化事件
        setTimeout(() => {
          // 设置标签切换事件
          EventHandler.setupTabEvents(container);

          // 初始手动检查一下当前状态
          if (StateManager.getCurrentTab() === 'old-order') {
            LinkManager.processOldOrderLinks();
          }
        }, 100);

        return container;
      });
    }
  }
};

// 初始化扩展
document.addEventListener('DOMContentLoaded', () => {
  // 初始化UI扩展
  ShopifyHistoricalOrders.initUIExtension();
});

export default ShopifyHistoricalOrders;
