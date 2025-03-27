/**
 * 订单服务 - 处理订单相关业务逻辑
 */

import { getMainApp } from "./vueService";
import { activeTab, type TabType } from "../store/tabStore";
import { type OrderItem } from "../types/index";
import OldOrderDetail from "../components/OldOrderDetail.svelte";
import { orderData } from "../utils/orderData";
// 标记表格观察器是否已设置
let tableObserverSetup = false;

// 保存当前打开的订单详情弹窗组件实例
let currentOrderModal: OldOrderDetail | null = null;

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

  try {
    // 获取Vue应用实例
    const app = getMainApp();
    if (!app?.orders?.data) {
      console.warn("无法获取订单数据");
      return false;
    }

    // 查找当前订单
    const currentOrder = app.orders.data.find(
      (item: { ID: string | number }) => String(item.ID) === String(orderId)
    );

    if (!currentOrder) {
      console.warn(`未找到订单ID: ${orderId}`);
      return false;
    }
    // 由于是开发阶段直接使用 orderData.js 数据(写死的，用于开发)
    // 否则使用我们的Svelte组件创建弹窗
    createOrderDetailModal(orderData);
    return true;
  } catch (error) {
    console.error("显示订单详情时出错:", error);
    return false;
  }
}

/**
 * 创建订单详情弹窗
 * @param order 订单数据
 */
function createOrderDetailModal(order: any): void {
  // 如果已经有打开的弹窗，先销毁它
  if (currentOrderModal) {
    currentOrderModal.$destroy();
    currentOrderModal = null;
  }

  // 创建一个容器元素
  const container = document.createElement("div");
  container.id = "old-order-detail-container";
  document.body.appendChild(container);

  // 获取主应用实例
  const app = getMainApp();
  console.log('app',app)
  // 预处理订单数据，确保与组件格式一致
  const processedOrder = {
    ...order,
    ID: order.ID || order.id,
    post_date: order.post_date || order.created_at,
    line_items: order.line_items || [],
    order_total: order.order_total || order.total_price,
    order_shipping: order.order_shipping || order.shipping_price,
    discount_total: order.discount_total || order.total_discounts,
    financial_status: order.financial_status || "unpaid",
    fulfillment_status: order.fulfillment_status || "unfulfilled",
    // 确保地址信息正确映射
    billing_address: order.billing_address || order.orderBilling || {},
    shipping_address: order.shipping_address || order.orderShipping || {},
  };

  // 处理地址字段映射
  if (processedOrder.billing_address) {
    processedOrder.billing_address = {
      ...processedOrder.billing_address,
      address_1:
        processedOrder.billing_address.address_1 ||
        processedOrder.billing_address.address1,
      address_2:
        processedOrder.billing_address.address_2 ||
        processedOrder.billing_address.address2,
      postcode:
        processedOrder.billing_address.postcode ||
        processedOrder.billing_address.zip,
      state:
        processedOrder.billing_address.state ||
        processedOrder.billing_address.province,
    };
  }

  if (processedOrder.shipping_address) {
    processedOrder.shipping_address = {
      ...processedOrder.shipping_address,
      address_1:
        processedOrder.shipping_address.address_1 ||
        processedOrder.shipping_address.address1,
      address_2:
        processedOrder.shipping_address.address_2 ||
        processedOrder.shipping_address.address2,
      postcode:
        processedOrder.shipping_address.postcode ||
        processedOrder.shipping_address.zip,
      state:
        processedOrder.shipping_address.state ||
        processedOrder.shipping_address.province,
    };
  }

  // 处理商品项目
  if (processedOrder.line_items) {
    processedOrder.line_items = processedOrder.line_items.map((item: any) => {
      return {
        ...item,
        order_item_id: item.order_item_id || item.id || item.orderitem_id,
        order_item_name:
          item.order_item_name || item.order_item_title || item.title,
        qty: item.qty || item.quantity,
        line_subtotal:
          item.line_subtotal ||
          parseFloat(item.price) * parseFloat(item.quantity || item.qty),
      };
    });
  }

  // 获取国际化对象
  const i18nObject: Record<string, string> = {
    "account.order": "Order",
    "account.product": "Product",
    "account.sku": "SKU",
    "account.price": "Price",
    "account.quantity": "Qty",
    "account.total": "Total",
    "account.subtotal": "Subtotal",
    "account.discount": "Discount",
    "account.shipping": "Shipping",
    "account.billing_address": "Billing Address",
    "account.payment_status": "Payment Status",
    "account.unpaid": "Unpaid",
    "account.shipping_address": "Shipping Address",
    "account.fulfillment_status": "Fulfillment Status",
    "account.unfulfilled": "Unfulfilled",
    "account.fulfilled": "Fulfilled",
  };

  // 如果应用存在i18n，则使用应用的国际化文本覆盖默认值
  if (app && app.$i18n && typeof app.$t === "function") {
    Object.keys(i18nObject).forEach((key) => {
      try {
        i18nObject[key] = app.$t(key) || i18nObject[key];
      } catch (e) {
        console.warn(`Failed to get translation for ${key}`, e);
      }
    });
  }

  // 实例化Svelte组件
  currentOrderModal = new OldOrderDetail({
    target: container,
    props: {
      order: processedOrder,
      i18n: i18nObject,
      onClose: () => {
        // 关闭弹窗时销毁组件和容器
        if (currentOrderModal) {
          currentOrderModal.$destroy();
          currentOrderModal = null;
        }
        document.body.removeChild(container);
      },
    },
  });
}

/**
 * 处理当前可见的订单链接
 * @param activeTab 当前活动标签
 * @returns 处理的链接数量
 */
function processCurrentOrderLinks(activeTab: TabType): number {
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
    const orderTable = document.querySelector(".ordertable");
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
      childList: true, // 子节点变化
      subtree: true, // 所有后代节点
      characterData: true, // 文本内容变化
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
function getActiveTabValue(): TabType {
  let value: TabType = "new-order";
  activeTab.subscribe((tab) => {
    value = tab;
  })();
  return value;
}
