import type { Order } from "../types";
import { StateManager } from "./StateManager";
import { VueManager } from "./VueManager";

/**
 * 订单数据服务
 */
export const OrderData = {
  /**
   * 从表格数据中获取订单信息
   */
  getOrderDataFromTable(orderId: string): Order | null {
    // 确保Vue实例存在
    let vueInstance = StateManager.getVueInstance();
    if (!vueInstance) {
      vueInstance = VueManager.findVueInstance();
      if (!vueInstance) return null;
    }

    // 从Vue实例中获取订单数据
    if (vueInstance.orders && vueInstance.orders.data) {
      return (
        vueInstance.orders.data.find(
          (order: Order) =>
            order.ID?.toString() === orderId || order.id?.toString() === orderId
        ) || null
      );
    }

    return null;
  },

  /**
   * 通过API获取订单详情
   */
  fetchOrderData(orderId: string): Promise<Order> {
    return new Promise((resolve, reject) => {
      if (!window.shopSDK || !window.shopSDK.io || !window.shopSDK.io.http) {
        reject(new Error("SDK未初始化，无法获取订单数据"));
        return;
      }

      window.shopSDK.io.http
        .get(`/api/store/orders/${orderId}`, { errorThrow: false })
        .then((res: any) => {
          if (res.success) {
            // 数据预处理
            const processedData = this.preprocessOrderData(res.responseBody);
            resolve(processedData);
          } else {
            reject(new Error("获取订单详情失败"));
          }
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  },

  /**
   * 预处理订单数据，确保字段格式一致
   */
  preprocessOrderData(orderData: Order): Order {
    if (!orderData) return orderData;

    // 深拷贝避免修改原始数据
    const data = JSON.parse(JSON.stringify(orderData));

    // 处理运费数组
    if (
      !data.shippings ||
      !Array.isArray(data.shippings) ||
      data.shippings.length === 0
    ) {
      data.shippings = [];
      if (data.order_shipping) {
        data.shippings.push({
          order_item_name: data.payment_channel_to_store || "Standard Shipping",
          price: data.order_shipping,
        });
      }
    }

    // 处理折扣信息
    if (!data.discount_record || !Array.isArray(data.discount_record)) {
      data.discount_record = [];
      if (data.coupon_code) {
        data.discount_record.push({
          code: data.coupon_code,
          auto_coupon: false,
        });
      }
    }

    // 确保line_items存在
    if (!data.line_items) {
      data.line_items = [];
    }

    return data;
  },

  /**
   * 通过API获取并显示订单详情
   */
  fetchAndShowOrder(orderId: string): void {
    this.fetchOrderData(orderId)
      .then((data) => {
        // 发布订单数据加载完成事件
        const event = new CustomEvent("shopify-history:order-loaded", {
          detail: { orderData: data },
        });
        document.dispatchEvent(event);
      })
      .catch((error: Error) => {
        console.error("获取订单详情出错:", error);
      });
  },
};

/**
 * 订单链接管理器
 */
export const LinkManager = {
  /**
   * 处理旧订单链接
   */
  processOldOrderLinks(): void {
    // 查找所有订单编号链接
    const orderLinks = document.querySelectorAll('a[href^="/account/orders"]');

    orderLinks.forEach((link) => {
      const linkElement = link as HTMLAnchorElement;
      // 保存原始URL
      if (!linkElement.dataset.originalHref) {
        linkElement.dataset.originalHref = linkElement.href;
      }

      // 从URL中提取订单ID
      const matches = linkElement.href.match(/\/account\/orders\/(\d+)/);
      if (matches && matches[1]) {
        const orderId = matches[1];

        // 替换为JavaScript点击事件
        linkElement.href = "javascript:void(0);";
        linkElement.dataset.orderId = orderId;

        // 如果还没有添加过点击事件，添加新的点击事件
        if (!linkElement.dataset.eventAttached) {
          linkElement.addEventListener("click", (e) => {
            e.preventDefault();
            OrderData.fetchAndShowOrder(orderId);
          });
          linkElement.dataset.eventAttached = "true";
        }
      }
    });
  },

  /**
   * 恢复原始订单链接
   */
  restoreOrderLinks(): void {
    // 恢复所有已修改的订单链接
    const modifiedLinks = document.querySelectorAll("a[data-original-href]");

    modifiedLinks.forEach((link) => {
      const linkElement = link as HTMLAnchorElement;
      if (linkElement.dataset.originalHref) {
        linkElement.href = linkElement.dataset.originalHref;
        delete linkElement.dataset.originalHref;
        delete linkElement.dataset.orderId;
        delete linkElement.dataset.eventAttached;
      }
    });
  },
};

/**
 * 事件处理器
 */
export const EventHandler = {
  /**
   * 设置标签页切换事件
   */
  setupTabEvents(container: HTMLElement): void {
    const tabs = container.querySelectorAll(".order-tab");

    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();

        // 移除所有活动标签
        tabs.forEach((t) => t.classList.remove("active"));

        // 设置当前标签为活动
        const clickedTab = e.currentTarget as HTMLElement;
        clickedTab.classList.add("active");

        // 更新当前选中的标签
        const tabType = clickedTab.getAttribute("data-tab");
        if (tabType === "new-order" || tabType === "old-order") {
          StateManager.setCurrentTab(tabType);

          // 处理对应的操作
          if (tabType === "old-order") {
            // 处理旧订单链接
            LinkManager.processOldOrderLinks();
          } else {
            // 恢复原始链接
            LinkManager.restoreOrderLinks();
          }
        }
      });
    });
  },
};
