/**
 * Vue实例管理器 - 用于缓存和管理Vue实例
 */
import { findVueInstance } from './vue';

// Vue实例接口定义
interface VueInstance {
  [key: string]: any;
  $el?: HTMLElement; // Vue实例的DOM元素
  $emit?: (event: string, ...args: any[]) => void;
  $parent?: VueInstance;
  handleCurrentChange?: (page: number) => void; // 分页器的页码变更方法
  currentPage?: number;
  orders?: {
    data?: Array<{
      ID?: number | string;
      id?: number | string;
      [key: string]: any;
    }>;
  };
  orderList?: Array<{
    ID?: number | string;
    id?: number | string;
    [key: string]: any;
  }>;
}

// Vue元素类型定义
interface VueElement extends HTMLElement {
  __vue__?: VueInstance;
}

/**
 * Vue实例管理器类 - 单例模式
 */
class VueInstanceManager {
  // 缓存对象
  private cache: {
    mainApp: VueInstance | null;
    pagination: VueInstance | null;
    [key: string]: VueInstance | null;
  };

  /**
   * 构造函数
   */
  constructor() {
    this.cache = {
      mainApp: null,
      pagination: null
    };
  }

  /**
   * 初始化并预缓存所有实例
   */
  public init(): void {
    console.log('初始化Vue实例缓存...');
    this.getMainAppInstance();
    this.getPaginationInstance();
    console.log('Vue实例缓存初始化完成', {
      mainApp: !!this.cache.mainApp,
      pagination: !!this.cache.pagination
    });
  }

  /**
   * 获取主应用Vue实例
   */
  public getMainAppInstance(): VueInstance | null {
    // 如果已有缓存，直接返回
    if (this.cache.mainApp) {
      return this.cache.mainApp;
    }

    // 尝试获取实例
    const instance = findVueInstance('div.account');
    if (instance) {
      this.cache.mainApp = instance;
      console.log('成功缓存主应用Vue实例');
    }

    return instance;
  }

  /**
   * 获取分页组件Vue实例
   */
  public getPaginationInstance(): VueInstance | null {
    // 如果已有缓存，直接返回
    if (this.cache.pagination) {
      return this.cache.pagination;
    }

    try {
      // 获取主应用Vue实例
      const accountVueInstance = this.getMainAppInstance();
      if (!accountVueInstance || !accountVueInstance.$el) {
        console.warn('未找到主应用Vue实例或其$el属性，无法获取分页实例');
        return null;
      }

      // 使用更直接的方式获取分页实例
      const elPagination = accountVueInstance.$el.querySelector('.el-pagination') as VueElement;
      if (!elPagination) {
        console.warn('在主应用中未找到.el-pagination元素');
        return null;
      }

      // 获取分页元素的Vue实例
      if (!elPagination.__vue__) {
        console.warn('.el-pagination元素没有__vue__属性');
        return null;
      }

      // 缓存并返回
      this.cache.pagination = elPagination.__vue__;
      console.log('成功缓存分页组件Vue实例');
      return this.cache.pagination;

    } catch (error) {
      console.error('获取分页实例失败:', error);
      return null;
    }
  }

  /**
   * 重置分页到第一页
   */
  public resetPaginationToFirstPage(): boolean {
    try {
      // 获取分页实例
      const pagination = this.cache.pagination || this.getPaginationInstance();
      if (!pagination) {
        console.warn('未找到分页实例，无法重置页码');
        return false;
      }

      // 使用handleCurrentChange方法(最优先，与原代码保持一致)
      if (pagination.handleCurrentChange) {
        // 延迟执行，确保Vue更新完成
        setTimeout(() => {
          pagination.handleCurrentChange!(1);
        }, 100);
        console.log('成功重置分页到第1页(handleCurrentChange)');
        return true;
      }

      // 尝试多种方式重置页码
      if (typeof pagination.currentPage !== 'undefined') {
        pagination.currentPage = 1;
        console.log('成功重置分页到第1页(直接属性设置)');
        return true;
      }

      if (pagination.$emit) {
        pagination.$emit('current-change', 1);
        console.log('成功重置分页到第1页(事件触发)');
        return true;
      }

      if (pagination.$parent && typeof pagination.$parent.currentPage !== 'undefined') {
        pagination.$parent.currentPage = 1;
        console.log('成功通过父组件重置分页到第1页');
        return true;
      }

      console.warn('无法重置分页，未找到合适的方法');
      return false;
    } catch (error) {
      console.error('重置分页失败:', error);
      return false;
    }
  }

  /**
   * 根据ID查找订单数据
   */
  public findOrderById(orderId: string): any | null {
    if (!orderId) return null;

    try {
      // 获取Vue实例
      const vueInstance = this.cache.mainApp || this.getMainAppInstance();
      if (!vueInstance) {
        console.warn('未找到Vue实例，无法获取订单数据');
        return null;
      }

      // 尝试从orders.data中查找
      if (vueInstance.orders && vueInstance.orders.data) {
        const order = vueInstance.orders.data.find(
          (order: any) =>
            order.ID?.toString() === orderId ||
            (order.id && order.id.toString() === orderId)
        );
        if (order) return order;
      }

      // 尝试从orderList中查找
      if (vueInstance.orderList) {
        const order = vueInstance.orderList.find(
          (order: any) =>
            order.ID?.toString() === orderId ||
            (order.id && order.id.toString() === orderId)
        );
        if (order) return order;
      }

      console.warn(`未找到订单ID: ${orderId} 的数据`);
      return null;
    } catch (error) {
      console.error('查找订单数据失败:', error);
      return null;
    }
  }

  /**
   * 重置所有缓存
   */
  public resetCache(): void {
    this.cache.mainApp = null;
    this.cache.pagination = null;
    console.log('已重置所有Vue实例缓存');
  }

  /**
   * 自定义缓存某个实例
   */
  public cacheInstance(key: string, instance: VueInstance): void {
    this.cache[key] = instance;
    console.log(`成功缓存自定义实例: ${key}`);
  }

  /**
   * 获取自定义缓存的实例
   */
  public getInstance(key: string): VueInstance | null {
    return this.cache[key] || null;
  }
}

// 导出单例实例
export const vueManager = new VueInstanceManager();
