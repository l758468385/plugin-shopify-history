/**
 * 订单服务 - 处理订单相关业务逻辑
 */

import { getMainApp } from "./vueService";
import { activeTab } from "../store/tabStore";

/**
 * 初始化订单服务
 * 设置对Tab状态的监听
 */
export function initOrderService(): void {
  // 订阅Tab状态变化
  activeTab.subscribe((tab) => {
    console.log(`Tab状态变化: ${tab}`);
    processCurrentOrderLinks(tab);
  });
  console.log("订单服务初始化完成");
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

  console.log(`显示订单详情，订单ID: ${orderId}`);

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
    console.log("未找到订单链接，可能数据尚未加载完成");
    return 0;
  }

  console.log(`处理 ${orderLinks.length} 个订单链接，当前模式: ${activeTab}`);

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
