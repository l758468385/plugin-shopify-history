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
  __vue__?: VueInstance;
};

// 保存获取到的Vue实例
const instances = {
  main: null as VueInstance | null,
  pagination: null as VueInstance | null
};

// 检查元素是否具有Vue实例
function isVueElement(element: HTMLElement): element is VueElement {
  return "__vue__" in element;
}

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

    const el = app.$el.querySelector('.el-pagination');
    if (!el || !('__vue__' in el)) return null;

    instances.pagination = (el as any).__vue__;
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
