/**
 * Shopify历史订单插件 - 主入口文件
 */
import TabSwitcher from "./components/TabSwitcher.svelte";

let tabSwitcher;

function initUIExtension() {
  if (window.UIExtensionPointSimpleMgr) {
    window.UIExtensionPointSimpleMgr.extend("order-history-tabs", () => {
      const container = document.createElement("div");
      container.className = "shopify-history-tabs-container";
      tabSwitcher = new TabSwitcher({
        target: container,
        props: {
          activeTab: "new-order",
        },
      });
      return container;
    });
  } else {
    console.warn("UIExtensionPointSimpleMgr 未找到，无法注册 UI 扩展");
  }
}

// 初始化扩展
document.addEventListener("DOMContentLoaded", () => {
  // 初始化UI扩展
  initUIExtension();
});

// 类型声明
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