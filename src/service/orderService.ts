/**
 * 订单服务 - 处理订单相关业务逻辑
 */

import { getMainApp } from "./vueService";
import { activeTab } from "../store/tabStore";

// 标记表格观察器是否已设置
let tableObserverSetup = false;

/**
 * 初始化订单服务
 * 设置对Tab状态的监听
 */
export function initOrderService(): void {
  // 订阅Tab状态变化
  activeTab.subscribe((tab) => {
    processCurrentOrderLinks(tab);
  });

  // 设置表格观察器
  setupTableObserver();
}

/**
 * 显示订单详情弹窗
 * @param orderId 订单ID
 * @returns 是否成功显示
 */
export function showOrderDetail(orderId: string): boolean {
  if (!orderId) {
    console.warn("订单ID为空，无法显示详情");
    return false;
  }

  // 尝试通过Vue实例显示
  const app = getMainApp();
  if (app && typeof app.showOrderDetail === "function") {
    app.showOrderDetail(orderId);
    return true;
  } else {
    // 简单弹窗显示
    alert(`将显示订单详情: ${orderId}`);
    return true;
  }
}

/**
 * 处理当前可见的订单链接
 * @param activeTab 当前活动标签
 * @returns 处理的链接数量
 */
function processCurrentOrderLinks(activeTab: string): number {
  const orderLinks = document.querySelectorAll<HTMLAnchorElement>(
    '.ordertable a[href^="/account/order/"]'
  );

  if (!orderLinks.length) {
    return 0;
  }

  orderLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const orderId = href.split("/").pop() || "";
    if (!orderId) return;

    if (activeTab === "old-order") {
      // 标记为已处理（防止重复处理）
      link.setAttribute("data-processed", "true");

      // 绑定点击事件，阻止默认跳转
      link.onclick = (e) => {
        e.preventDefault();
        showOrderDetail(orderId);
        return false;
      };
    } else {
      // 移除处理标记
      link.removeAttribute("data-processed");

      // 还原默认行为
      link.onclick = null;
    }
  });

  return orderLinks.length;
}

/**
 * 设置表格观察器，监听表格内容变化
 */
function setupTableObserver(): void {
  // 如果已经设置过，不重复设置
  if (tableObserverSetup) return;

  // 查找表格
  const findAndObserveTable = () => {
    // 查找订单表格
    const orderTable = document.querySelector('.ordertable');
    if (!orderTable) return false;

    const observer = new MutationObserver(() => {
      // 获取当前tab
      const currentTab = getActiveTabValue();

      // 临时断开观察器，防止死循环
      observer.disconnect();

      // 处理订单链接
      setTimeout(() => {
        processCurrentOrderLinks(currentTab);

        // 处理完成后重新连接观察器
        observer.observe(orderTable, config);
      }, 100);
    });

    // 观察配置 - 监听所有可能的变化
    const config = {
      childList: true,  // 子节点变化
      subtree: true,    // 所有后代节点
      characterData: true // 文本内容变化
    };

    // 开始观察
    observer.observe(orderTable, config);

    // 标记为已设置
    tableObserverSetup = true;
    return true;
  };

  // 立即尝试设置
  if (!findAndObserveTable()) {
    // 如果没找到表格，等待DOM加载后重试
    setTimeout(() => {
      if (!tableObserverSetup) {
        findAndObserveTable();
      }
    }, 1000);
  }
}

/**
 * 获取当前活动标签值
 */
function getActiveTabValue(): string {
  let value = '';
  activeTab.subscribe(tab => { value = tab; })();
  return value;
}
