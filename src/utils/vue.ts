// Vue实例类型定义
export type VueElement = HTMLElement & {
  __vue__?: {
    [key: string]: any;
  };
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
export function findVueInstance(selector: string): any | null {
  try {
    // 获取所有匹配选择器的元素
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) {
      console.warn(`未找到匹配选择器 "${selector}" 的元素`);
      return null;
    }

    console.log(`找到 ${elements.length} 个匹配 "${selector}" 的元素`);

    // 检查所有匹配元素本身是否包含Vue实例
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      if (isVueElement(element) && element.__vue__) {
        console.log(`第 ${i + 1} 个匹配元素本身包含Vue实例`);
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
