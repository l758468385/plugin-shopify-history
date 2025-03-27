/**
 * 用于获取 Vue 实例
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
  pagination: null as VueInstance | null,
};

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

  const instance = findVueInstance("div.account");
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

    const el = app.$el.querySelector(".el-pagination") as HTMLElement | null;
    if (!el || !isVueElement(el)) return null;

    instances.pagination = el.__vue__ as VueInstance;
    return instances.pagination;
  } catch (err) {
    console.error("获取分页实例出错:", err);
    return null;
  }
}
