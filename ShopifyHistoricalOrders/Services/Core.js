/**
 * 核心模块 - 包含状态管理和基础工具函数
 */

// 全局状态
const state = {
  currentTab: 'new-order',
  vueInstance: null
};

// 状态管理
const StateManager = {
  getCurrentTab() {
    return state.currentTab;
  },

  setCurrentTab(tab) {
    state.currentTab = tab;
  },

  getVueInstance() {
    return state.vueInstance;
  },

  setVueInstance(instance) {
    state.vueInstance = instance;
  }
};

// DOM操作工具
const DOMUtils = {
  // 创建标签切换组件
  createTabComponent() {
    const container = document.createElement('div');
    container.className = 'order-history-tabs';
    container.style.marginBottom = '20px';
    container.innerHTML = `
      <div style="display: flex; margin-bottom: 20px;">
        <a href="javascript:;" class="order-tab active" data-tab="new-order" style="background-color: #333; color: #fff; padding: 10px 20px; text-decoration: none; margin-right: 15px; border: 1px solid #333;">
          New Order
        </a>
        <a href="javascript:;" class="order-tab" data-tab="old-order" style="background-color: #fff; color: #333; padding: 10px 20px; text-decoration: none; border: 1px solid #ddd;">
          Old Order
        </a>
      </div>
    `;
    return container;
  }
};

// Vue实例操作
const VueManager = {
  // 查找Vue实例
  findVueInstance() {
    console.log('开始查找Vue实例...');

    // 查找分页组件所在的Vue实例
    const paginationEl = document.querySelector('.el-pagination');
    if (!paginationEl) {
      console.warn('未找到分页组件');
      return null;
    }

    // 获取Vue实例
    let currentEl = paginationEl;

    // 向上查找，获取Vue组件实例
    while (currentEl) {
      if (currentEl.__vue__) {
        // 尝试查找changePage方法
        if (typeof currentEl.__vue__.changePage === 'function') {
          console.log('找到Vue实例');
          const instance = currentEl.__vue__;
          StateManager.setVueInstance(instance);
          return instance;
        } else if (currentEl.__vue__.$parent && typeof currentEl.__vue__.$parent.changePage === 'function') {
          console.log('在父组件中找到Vue实例');
          const instance = currentEl.__vue__.$parent;
          StateManager.setVueInstance(instance);
          return instance;
        }
      }
      currentEl = currentEl.parentElement;
    }

    console.warn('未找到包含changePage方法的Vue实例');
    return null;
  },

  // 重置分页到第1页
  resetPagination() {
    const vueInstance = StateManager.getVueInstance();
    if (!vueInstance) {
      return;
    }

    // 调用changePage方法加载第1页数据
    vueInstance.changePage(1);

    // 如果Vue实例有currentPage属性，设置为1
    if ('currentPage' in vueInstance) {
      vueInstance.currentPage = 1;
    }
  }
};

export { StateManager, DOMUtils, VueManager };
