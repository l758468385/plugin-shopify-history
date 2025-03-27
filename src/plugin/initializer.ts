/**
 * 插件初始化器 - 负责初始化和挂载TabSwitcher组件
 */
import TabSwitcher from "../components/TabSwitcher.svelte";

// 组件实例
let tabSwitcher: any;

/**
 * 通过扩展点挂载组件
 * @returns {boolean} 是否成功挂载
 */
function mountViaExtensionPoint(): boolean {
  if (!window.UIExtensionPointSimpleMgr) {
    console.warn("UIExtensionPointSimpleMgr 未找到");
    return false;
  }

  try {
    // 检查扩展点是否可用
    const extensionPoint = document.querySelector(
      'ws-extension-point-simple[data-point-key="order-history-tabs"]'
    );
    console.log("extensionPoint", extensionPoint);
    if (!extensionPoint) {
      console.warn("未找到 order-history-tabs 扩展点");
      return false;
    }

    // 使用扩展点挂载组件
    console.log("找到 order-history-tabs 扩展点，使用扩展点方式挂载");
    window.UIExtensionPointSimpleMgr.extend("order-history-tabs", () => {
      const container = document.createElement("div");
      container.className = "shopify-history-tabs-container";

      tabSwitcher = new TabSwitcher({
        target: container,
      });
      return container;
    });
    return true;
  } catch (error) {
    console.error("使用扩展点方式挂载失败:", error);
    return false;
  }
}

/**
 * 通过DOM查询方式挂载组件
 */
function mountViaDOMQuery(): void {
  const orderTitle = document.querySelector("h2.orderstitle");
  // 创建容器并插入到h2标题后面
  const container = document.createElement("div");
  container.className = "shopify-history-tabs-container";
  tabSwitcher = new TabSwitcher({
    target: container,
  });
  if (orderTitle && orderTitle.parentNode) {
    orderTitle.parentNode.insertBefore(container, orderTitle.nextSibling);
  }
}

/**
 * 初始化插件
 * 先尝试使用扩展点方式，如果失败则使用DOM查询方式
 */
export function initializePlugin(): void {
  setTimeout(() => {
    console.log("Shopify历史订单插件初始化...");

    // 尝试通过扩展点挂载
    const mountedViaExtensionPoint = mountViaExtensionPoint();

    // 如果扩展点挂载失败，使用DOM查询方式
    if (!mountedViaExtensionPoint) {
      console.log("扩展点挂载失败，尝试DOM查询方式...");
      mountViaDOMQuery();
    }
  }, 500);
}
