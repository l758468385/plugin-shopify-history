/**
 * 订单类型定义
 */
export interface OrderItem {
  ID?: string;
  id?: string;
  order_number?: string;
  price?: number;
  product_id?: string;
  product_title?: string;
  quantity?: number;
  title?: string;
  variant_title?: string;
  sku?: string;
  properties?: Record<string, string>[];
}

export interface ShippingItem {
  order_item_name: string;
  price: number;
}

export interface DiscountRecord {
  code: string;
  auto_coupon: boolean;
}

export interface OrderAddress {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  province?: string;
  zip?: string;
}

export interface Order {
  ID?: string;
  id?: string;
  order_id?: string;
  order_number?: string;
  created_at?: string;
  CreatedAt?: string;
  post_date?: string;
  shipping_status?: string;
  financial_status?: string;
  fulfillment_status?: string;
  total_price?: number;
  subtotal_price?: number;
  total_shipping?: number;
  total_tax?: number;
  total_discounts?: number;
  discount_codes?: string[];
  order_shipping?: number;
  payment_channel_to_store?: string;
  line_items?: OrderItem[];
  shippings?: ShippingItem[];
  discount_record?: DiscountRecord[];
  billing_address?: OrderAddress;
  shipping_address?: OrderAddress;
  currency?: string;
  payment_method?: string;
  customer?: {
    email?: string;
    name?: string;
  };
  coupon_code?: string;
}

/**
 * 界面状态类型定义
 */
export interface State {
  currentTab: 'new-order' | 'old-order';
  vueInstance: any; // Vue 实例类型，由于不依赖 Vue，使用 any
}

/**
 * Vue实例接口（简化版）
 */
export interface VueInstance {
  $t?: (key: string, params?: Record<string, any>) => string;
  changePage?: (page: number) => void;
  currentPage?: number;
  orders?: {
    data?: Order[];
  };
  [key: string]: any;
}

/**
 * ShopSDK Http 服务
 */
export interface ShopSDKHttp {
  get: (url: string, options?: Record<string, any>) => Promise<any>;
  post: (url: string, data?: any, options?: Record<string, any>) => Promise<any>;
}

/**
 * ShopSDK IO 服务
 */
export interface ShopSDKIO {
  http: ShopSDKHttp;
}

/**
 * ShopSDK 接口
 */
export interface ShopSDK {
  io: ShopSDKIO;
}

// 全局变量扩展
declare global {
  interface Window {
    shopSDK: ShopSDK;
  }
} 