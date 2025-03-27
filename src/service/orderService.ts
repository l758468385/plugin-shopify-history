/**
 * 订单服务 - 处理订单相关业务逻辑
 */

import { getMainApp } from "./vueService";

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
 * 切换订单链接模式
 * @param activeTab 当前活动标签
 * @returns 处理的链接数量
 */
export function switchOrderLinkMode(activeTab: string): number {
  const orderLinks = document.querySelectorAll<HTMLAnchorElement>(
    '.ordertable a[href^="/account/order/"]'
  );

  if (!orderLinks.length) return 0;

  orderLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const orderId = href.split("/").pop() || "";
    if (!orderId) return;

    if (activeTab === "old-order") {
      // 绑定点击事件，阻止默认跳转
      link.onclick = (e) => {
        e.preventDefault();
        showOrderDetail(orderId);
      };
    } else {
      // 还原默认行为
      link.onclick = null;
    }
  });

  return orderLinks.length;
}
