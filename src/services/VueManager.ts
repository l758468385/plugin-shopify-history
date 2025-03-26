import type { VueInstance } from "../types";
import { StateManager } from "./StateManager";

/**
 * Vue实例操作工具
 */
export const VueManager = {
  /**
   * 查找Vue实例
   */
  findVueInstance(): VueInstance | null {
    console.log("开始查找Vue实例...");

    // 查找分页组件所在的Vue实例
    const paginationEl = document.querySelector(".el-pagination");
    if (!paginationEl) {
      console.warn("未找到分页组件");
      return null;
    }

    // 获取Vue实例
    let currentEl = paginationEl as HTMLElement;

    // 向上查找，获取Vue组件实例
    while (currentEl) {
      const vueEl = currentEl as any;
      if (vueEl.__vue__) {
        // 尝试查找changePage方法
        if (typeof vueEl.__vue__.changePage === "function") {
          console.log("找到Vue实例");
          const instance = vueEl.__vue__;
          StateManager.setVueInstance(instance);
          return instance;
        } else if (
          vueEl.__vue__.$parent &&
          typeof vueEl.__vue__.$parent.changePage === "function"
        ) {
          console.log("在父组件中找到Vue实例");
          const instance = vueEl.__vue__.$parent;
          StateManager.setVueInstance(instance);
          return instance;
        }
      }
      currentEl = currentEl.parentElement as HTMLElement;
      if (!currentEl) break;
    }

    console.warn("未找到包含changePage方法的Vue实例");
    return null;
  },

  /**
   * 重置分页到第1页
   */
  resetPagination(): void {
    const vueInstance = StateManager.getVueInstance();
    if (!vueInstance) {
      return;
    }

    // 调用changePage方法加载第1页数据
    if (typeof vueInstance.changePage === "function") {
      vueInstance.changePage(1);
    }

    // 如果Vue实例有currentPage属性，设置为1
    if ("currentPage" in vueInstance) {
      vueInstance.currentPage = 1;
    }
  },
};
