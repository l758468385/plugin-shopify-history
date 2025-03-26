/**
 * Shopify历史订单插件 - 主入口文件
 */
import TabSwitcher from "./components/TabSwitcher.svelte";
import { vueManager } from "./utils/vueInstanceManager";

let tabSwitcher;

function initUIExtension() {
  // 延迟初始化Vue实例缓存，确保页面已加载
  setTimeout(() => {
    vueManager.init();
    console.log("Vue实例缓存初始化完成");
  }, 1500); // 延迟1.5秒，与原代码的延迟保持一致

  if (false) {
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
    }
  } else {
    console.warn("UIExtensionPointSimpleMgr 未找到，尝试直接寻找Order History标题");

    // 尝试寻找Order History标题
    let retryCount = 0;
    const maxRetries = 10; // 最多尝试10次，共5秒

    const findAndInjectTabSwitcher = () => {
      // 尝试找到带有特定属性和类的Order History标题
      const orderHistoryTitle = document.querySelector('h2[data-v-2b39e494].orderstitle');
      // 如果没找到，尝试更通用的选择器
      const fallbackTitle = orderHistoryTitle || document.querySelector('h2.orderstitle');

      // 检查元素是否存在，父节点是否存在，以及文本内容是否包含"Order History"
      if (
        fallbackTitle &&
        fallbackTitle.parentNode &&
        fallbackTitle.textContent &&
        fallbackTitle.textContent.includes("Order History")
      ) {
        // 创建容器并插入到h2标题后面
        const container = document.createElement("div");
        container.className = "shopify-history-tabs-container";

        // 将容器插入到h2标题后面（作为兄弟元素）
        fallbackTitle.parentNode.insertBefore(container, fallbackTitle.nextSibling);

        // 实例化TabSwitcher组件
        tabSwitcher = new TabSwitcher({
          target: container,
          props: {
            activeTab: "new-order",
          },
        });

        console.log("成功将TabSwitcher插入到Order History标题后面");
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`未找到符合条件的Order History标题，将在500ms后进行第${retryCount}次重试`);
          // 如果未找到，可能是页面还未完全加载，500ms后重试
          setTimeout(findAndInjectTabSwitcher, 500);
        } else {
          console.error("多次尝试后仍未找到Order History标题，放弃注入TabSwitcher");
        }
      }
    };

    // 开始尝试寻找并注入
    findAndInjectTabSwitcher();
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
