/**
 * Vue工具函数 - 用于获取和操作Vue实例
 */

// Vue实例类型定义
export interface VueInstance {
  [key: string]: any;
  $el?: HTMLElement;
  $emit?: (event: string, ...args: any[]) => void;
}

// Vue元素类型定义
export type VueElement = HTMLElement & {
  __vue__?: {
    [key: string]: any;
  };
};

// 判断元素是否为Vue元素
export function isVueElement(element: HTMLElement): element is VueElement {
  return "__vue__" in element;
}

// 保存获取到的Vue实例
const instances = {
  main: null as VueInstance | null,
  pagination: null as VueInstance | null
};

// Vue实例缓存
class VueInstanceManager {
  private static instance: VueInstanceManager;
  private vueInstance: any | null = null;
  private initialized = false;
  private orderLinkInterceptorActive = false;

  private constructor() {}

  // 单例模式
  public static getInstance(): VueInstanceManager {
    if (!VueInstanceManager.instance) {
      VueInstanceManager.instance = new VueInstanceManager();
    }
    return VueInstanceManager.instance;
  }

  // 获取Vue实例
  public getVueInstance(): any | null {
    if (!this.initialized) {
      this.vueInstance = this.findVueInstance();
      this.initialized = true;
    }
    return this.vueInstance;
  }

  // 强制刷新Vue实例
  public refreshVueInstance(): any | null {
    this.vueInstance = this.findVueInstance();
    this.initialized = true;
    return this.vueInstance;
  }

  // 重置Vue实例
  public resetVueInstance(): void {
    this.vueInstance = null;
    this.initialized = false;
  }

  // 重置分页
  public resetPagination(): void {
    const vueInstance = this.getVueInstance();
    if (!vueInstance) return;

    try {
      // 查找分页组件
      if (vueInstance.$refs && vueInstance.$refs.pagination) {
        vueInstance.$refs.pagination.currentPage = 1;
      } else if (vueInstance.currentPage !== undefined) {
        // 直接设置当前页
        vueInstance.currentPage = 1;
      }
    } catch (error) {
      console.error("Failed to reset pagination:", error);
    }
  }

  // 设置链接拦截器
  public setupOrderLinkInterceptor(activeTab: string): void {
    // 如果已经设置过，不再重复设置
    if (this.orderLinkInterceptorActive) return;
    this.orderLinkInterceptorActive = true;

    // 监听文档点击事件
    document.addEventListener('click', (event) => {
      // 只有在old-order标签页下才拦截链接
      if (activeTab !== 'old-order') return;

      const target = event.target as HTMLElement;
      const link = target.closest('a[href^="/account/order/"]');

      if (link) {
        event.preventDefault();

        // 获取订单ID
        const href = link.getAttribute('href') || '';
        const orderId = href.split('/').pop() || '';

        if (orderId) {
          // 显示订单弹窗
          this.showOrderDialog(orderId);
        }
      }
    }, true);
  }

  // 显示订单弹窗
  public showOrderDialog(orderId: string): void {
    const vueInstance = this.getVueInstance();
    if (!vueInstance) return;

    // 如果Vue实例有显示弹窗的方法，调用它
    if (typeof vueInstance.showOrderDialog === 'function') {
      vueInstance.showOrderDialog(orderId);
    } else {
      // 尝试设置状态触发弹窗
      if (vueInstance.$set) {
        try {
          // 设置当前查看的订单ID
          vueInstance.$set(vueInstance, 'viewingOrderId', orderId);
          // 显示弹窗
          vueInstance.$set(vueInstance, 'showOrderDialog', true);
        } catch (error) {
          console.error("Error showing dialog:", error);
        }
      }
    }
  }

  // 查找Vue实例
  private findVueInstance(): any | null {
    try {
      // UI 扩展点
      const extensionPoint = document.querySelector(
        'ws-extension-point-simple[data-point-key="order-history-tabs"]',
      );
      if (!extensionPoint) return null;

      // 向上查找Vue实例
      let currentElement = extensionPoint.parentElement;
      while (currentElement) {
        if (isVueElement(currentElement) && currentElement.__vue__) {
          return currentElement.__vue__;
        }
        currentElement = currentElement.parentElement;
      }
      return null;
    } catch (error) {
      console.error("Failed to find Vue instance:", error);
      return null;
    }
  }
}

// 导出 Vue 实例管理器
export const vueManager = VueInstanceManager.getInstance();

/**
 * 通过CSS选择器查找Vue实例
 * @param selector 要查找的CSS选择器
 * @returns 找到的Vue实例，或null
 */
export function findVueInstance(selector: string): VueInstance | null {
  try {
    // 获取所有匹配选择器的元素
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) {
      console.warn(`未找到匹配选择器 "${selector}" 的元素`);
      return null;
    }

    // 检查所有匹配元素本身是否包含Vue实例
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      if (isVueElement(element) && element.__vue__) {
        return element.__vue__;
      }
    }
    console.warn(`在所有 "${selector}" 匹配元素中均未找到Vue实例`);
    return null;
  } catch (error) {
    console.error(`查找Vue实例失败:`, error);
    return null;
  }
}

/**
 * 获取主应用Vue实例
 */
export function getMainApp(): VueInstance | null {
  if (instances.main) {
    return instances.main;
  }

  const instance = findVueInstance('div.account');
  if (instance) {
    instances.main = instance;
  }

  return instance;
}

/**
 * 获取分页Vue实例
 */
export function getPagination(): VueInstance | null {
  if (instances.pagination) {
    return instances.pagination;
  }

  try {
    const app = getMainApp();
    if (!app || !app.$el) return null;

    const el = app.$el.querySelector('.el-pagination') as HTMLElement | null;
    if (!el || !isVueElement(el)) return null;

    instances.pagination = el.__vue__ as VueInstance;
    return instances.pagination;
  } catch (err) {
    console.error('获取分页实例出错:', err);
    return null;
  }
}

/**
 * 重置分页到第一页
 */
export function resetPagination(): boolean {
  const pagination = getPagination();
  if (!pagination) return false;

  try {
    // 直接使用handleCurrentChange方法重置页码
    setTimeout(() => pagination.handleCurrentChange(1), 100);
    return true;
  } catch (err) {
    console.error('重置分页出错:', err);
    return false;
  }
}

/**
 * 查找订单数据
 */
export function findOrder(orderId: string): any | null {
  if (!orderId) return null;

  try {
    const app = getMainApp();
    if (!app) return null;

    // 查找数据源1
    if (app.orders?.data) {
      const order = app.orders.data.find((o: any) =>
        o.ID?.toString() === orderId || o.id?.toString() === orderId
      );
      if (order) return order;
    }

    // 查找数据源2
    if (app.orderList) {
      const order = app.orderList.find((o: any) =>
        o.ID?.toString() === orderId || o.id?.toString() === orderId
      );
      if (order) return order;
    }

    return null;
  } catch (err) {
    console.error('查找订单数据出错:', err);
    return null;
  }
}

/**
 * 重置所有已保存的实例
 */
export function reset(): void {
  instances.main = null;
  instances.pagination = null;
}
