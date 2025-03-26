// Vue实例类型定义
export type VueElement = HTMLElement & {
  __vue__?: {
    [key: string]: any;
  };
};

// Vue实例缓存
class VueInstanceManager {
  private static instance: VueInstanceManager;
  private vueInstance: any | null = null;
  private initialized = false;

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

  // 类型守卫
  private isVueElement(element: HTMLElement): element is VueElement {
    return "__vue__" in element;
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
        if (this.isVueElement(currentElement) && currentElement.__vue__) {
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
