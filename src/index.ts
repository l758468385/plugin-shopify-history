/**
 * Shopify历史订单插件 - 主入口文件
 */
import TabSwitcher from "./components/TabSwitcher.svelte";
import OrderDetailModal from "./components/OrderDetailModal.svelte";
import type { Order } from "./types";

/**
 * 主应用模块
 */
const ShopifyHistoricalOrders = {
  // 组件实例
  components: {
    tabSwitcher: null as any,
    orderModal: null as any,
  },

  // 初始化UI扩展点
  initUIExtension() {
    if (window.UIExtensionPointSimpleMgr) {
      // 订单历史页面的 Tab 切换组件
      window.UIExtensionPointSimpleMgr.extend(
        "order-history-tabs",
        (container: HTMLElement) => {
          // 创建 Tab 切换组件
          this.components.tabSwitcher = new TabSwitcher({
            target: container,
            props: {
              activeTab: "new-order",
            },
          });

          return container;
        }
      );
    } else {
      console.warn("UIExtensionPointSimpleMgr 未找到，无法注册 UI 扩展");
    }

    // 创建订单详情弹窗
    const modalContainer = document.createElement("div");
    modalContainer.id = "shopify-history-order-modal";
    document.body.appendChild(modalContainer);

    this.components.orderModal = new OrderDetailModal({
      target: modalContainer,
      props: {
        visible: false,
        orderData: null,
      },
    });

    // 监听订单数据加载事件
    document.addEventListener(
      "shopify-history:order-loaded",
      (event: Event) => {
        const customEvent = event as CustomEvent<{ orderData: Order }>;
        if (customEvent.detail && customEvent.detail.orderData) {
          this.components.orderModal.$set({
            visible: true,
            orderData: customEvent.detail.orderData,
          });
        }
      }
    );
  },
};

// 初始化扩展
document.addEventListener("DOMContentLoaded", () => {
  // 初始化UI扩展
  ShopifyHistoricalOrders.initUIExtension();
});

// 为全局访问提供接口
window.ShopifyHistoricalOrders = ShopifyHistoricalOrders;

// 类型声明
declare global {
  interface Window {
    UIExtensionPointSimpleMgr?: {
      extend: (
        name: string,
        callback: (container: HTMLElement) => HTMLElement
      ) => void;
    };
    ShopifyHistoricalOrders: typeof ShopifyHistoricalOrders;
  }
}

export default ShopifyHistoricalOrders;
