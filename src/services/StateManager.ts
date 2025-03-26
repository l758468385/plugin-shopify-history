import type { State, VueInstance } from "../types";

// 全局状态
const state: State = {
  currentTab: "new-order",
  vueInstance: null,
};

/**
 * 状态管理服务
 */
export const StateManager = {
  /**
   * 获取当前标签页
   */
  getCurrentTab(): "new-order" | "old-order" {
    return state.currentTab;
  },

  /**
   * 设置当前标签页
   */
  setCurrentTab(tab: "new-order" | "old-order"): void {
    state.currentTab = tab;
  },

  /**
   * 获取Vue实例
   */
  getVueInstance(): VueInstance | null {
    return state.vueInstance;
  },

  /**
   * 设置Vue实例
   */
  setVueInstance(instance: VueInstance): void {
    state.vueInstance = instance;
  },
};
