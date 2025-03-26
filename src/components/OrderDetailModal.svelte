<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { Order, OrderItem } from "../types";
  import { StateManager } from "../services/StateManager";

  // 显示状态
  export let visible = false;
  export let orderData: Order | null = null;

  // 便捷方法
  let vueInstance = StateManager.getVueInstance();
  const t = (key: string, params: Record<string, any> = {}) => {
    if (vueInstance && vueInstance.$t) {
      return vueInstance.$t(key, params);
    }
    // 默认值映射
    const defaultTexts: Record<string, string> = {
      "account.order": "订单",
      "account.shipping_address": "收货地址",
      "account.billing_address": "账单地址",
      "account.order_summary": "订单摘要",
      "account.order_details": "订单详情",
      "account.order_date": "下单日期",
      "account.payment_status": "支付状态",
      "account.fulfillment_status": "配送状态",
      "account.subtotal": "小计",
      "account.shipping": "运费",
      "account.total": "总计",
      "account.discounts": "折扣",
      "account.product": "商品",
      "account.quantity": "数量",
      "account.price": "价格",
    };
    return defaultTexts[key] || key;
  };

  // 移动设备检测
  const isMobile = window.innerWidth <= 768;

  // 格式化日期
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 格式化货币
  function formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return "";

    // 获取货币符号
    const currencySymbol =
      orderData?.currency === "USD"
        ? "$"
        : orderData?.currency === "EUR"
          ? "€"
          : orderData?.currency === "GBP"
            ? "£"
            : "¥";

    return currencySymbol + value.toFixed(2);
  }

  // 格式化地址
  function formatAddress(address: any): string {
    if (!address) return "";

    const parts = [
      address.first_name,
      address.last_name,
      address.address1,
      address.address2,
      address.city,
      address.province,
      address.country,
      address.zip,
      address.phone,
    ].filter(Boolean);

    return parts.join(", ");
  }

  // 处理ESC键关闭
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && visible) {
      visible = false;
    }
  }

  // 生命周期
  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  // 商品相关函数
  function getProductName(item: OrderItem): string {
    return item.product_title || item.title || "";
  }

  function getProductVariant(item: OrderItem): string {
    return item.variant_title || "";
  }

  function getProductQuantity(item: OrderItem): number {
    return item.quantity || 0;
  }

  function getProductPrice(item: OrderItem): number {
    return item.price || 0;
  }
</script>

{#if visible && orderData}
  <div class="order-popup-overlay" on:click|self={() => (visible = false)}>
    <div class="order-popup-content">
      <!-- 弹窗头部 -->
      <div class="order-popup-header">
        <div class="order-popup-title">
          <h4>
            {t("account.order")} #{orderData.ID ||
              orderData.id ||
              orderData.order_number ||
              ""}
          </h4>
          <p class="order-time">
            {formatDate(
              orderData.post_date ||
                orderData.created_at ||
                orderData.CreatedAt,
            )}
          </p>
        </div>
        <button class="order-popup-close" on:click={() => (visible = false)}
          >×</button
        >
      </div>

      <!-- 弹窗主体 -->
      <div class="order-popup-body">
        <!-- 订单信息 -->
        <div class="order-info-section">
          <h5>{t("account.order_summary")}</h5>
          <div class="order-info-items">
            <!-- 订单日期 -->
            <div class="order-info-item">
              <div class="info-label">{t("account.order_date")}</div>
              <div class="info-value">
                {formatDate(
                  orderData.post_date ||
                    orderData.created_at ||
                    orderData.CreatedAt,
                )}
              </div>
            </div>

            <!-- 支付状态 -->
            <div class="order-info-item">
              <div class="info-label">{t("account.payment_status")}</div>
              <div class="info-value">
                <span
                  class="status-badge {orderData.financial_status || 'pending'}"
                  >{orderData.financial_status || "pending"}</span
                >
              </div>
            </div>

            <!-- 配送状态 -->
            <div class="order-info-item">
              <div class="info-label">{t("account.fulfillment_status")}</div>
              <div class="info-value">
                <span
                  class="status-badge {orderData.fulfillment_status ||
                    'unfulfilled'}"
                  >{orderData.fulfillment_status || "unfulfilled"}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 地址信息 -->
        <div class="address-sections">
          <!-- 收货地址 -->
          {#if orderData.shipping_address}
            <div class="address-section">
              <h5>{t("account.shipping_address")}</h5>
              <div class="address-content">
                {formatAddress(orderData.shipping_address)}
              </div>
            </div>
          {/if}

          <!-- 账单地址 -->
          {#if orderData.billing_address}
            <div class="address-section">
              <h5>{t("account.billing_address")}</h5>
              <div class="address-content">
                {formatAddress(orderData.billing_address)}
              </div>
            </div>
          {/if}
        </div>

        <!-- 商品列表 -->
        <div class="order-items-section">
          <h5>{t("account.order_details")}</h5>
          <table class="order-items-table">
            <thead>
              <tr>
                <th>{t("account.product")}</th>
                <th class="text-center">{t("account.quantity")}</th>
                <th class="text-right">{t("account.price")}</th>
              </tr>
            </thead>
            <tbody>
              {#if orderData.line_items && orderData.line_items.length > 0}
                {#each orderData.line_items as item}
                  <tr>
                    <td>
                      <div class="product-name">{getProductName(item)}</div>
                      {#if getProductVariant(item)}
                        <div class="product-variant">
                          {getProductVariant(item)}
                        </div>
                      {/if}
                    </td>
                    <td class="text-center">{getProductQuantity(item)}</td>
                    <td class="text-right"
                      >{formatCurrency(getProductPrice(item))}</td
                    >
                  </tr>
                {/each}
              {:else}
                <tr>
                  <td colspan="3" class="text-center">暂无商品数据</td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>

        <!-- 价格摘要 -->
        <div class="order-summary-section">
          <div class="price-summary">
            <!-- 小计 -->
            <div class="price-row">
              <div class="price-label">{t("account.subtotal")}</div>
              <div class="price-value">
                {formatCurrency(orderData.subtotal_price)}
              </div>
            </div>

            <!-- 折扣 -->
            {#if orderData.total_discounts && orderData.total_discounts > 0}
              <div class="price-row">
                <div class="price-label">{t("account.discounts")}</div>
                <div class="price-value discount">
                  -{formatCurrency(orderData.total_discounts)}
                </div>
              </div>
            {/if}

            <!-- 运费 -->
            {#if orderData.total_shipping && orderData.total_shipping > 0}
              <div class="price-row">
                <div class="price-label">{t("account.shipping")}</div>
                <div class="price-value">
                  {formatCurrency(orderData.total_shipping)}
                </div>
              </div>
            {/if}

            <!-- 税费 -->
            {#if orderData.total_tax && orderData.total_tax > 0}
              <div class="price-row">
                <div class="price-label">Tax</div>
                <div class="price-value">
                  {formatCurrency(orderData.total_tax)}
                </div>
              </div>
            {/if}

            <!-- 总计 -->
            <div class="price-row total">
              <div class="price-label">{t("account.total")}</div>
              <div class="price-value">
                {formatCurrency(orderData.total_price)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .order-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-family: var(
      --text-font-family,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif
    );
  }

  .order-popup-content {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
    width: 90%;
    max-width: 1000px;
    padding: 24px;
    position: relative;

    @media screen and (max-width: 768px) {
      width: 95%;
      padding: 15px;
    }
  }

  .order-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .order-popup-title {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      h4 {
        margin: 0;
        font-size: 20px;
        font-weight: 400;
        color: #222a40;
      }

      .order-time {
        font-size: 14px;
        font-weight: 300;
        color: #666666;
        margin: 0;
        margin-left: 20px;
        line-height: 30px;

        @media screen and (max-width: 768px) {
          margin-left: 0;
          width: 100%;
          margin-top: 5px;
        }
      }
    }
  }

  .order-popup-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    line-height: 1;

    &:hover {
      color: #333;
    }
  }

  .order-popup-body {
    display: flex;
    flex-direction: column;
    gap: 24px;

    h5 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
  }

  .order-info-items {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .order-info-item {
      flex: 1;
      min-width: 200px;

      .info-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }

      .info-value {
        font-size: 14px;
        color: #333;
      }
    }
  }

  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;

    &.paid {
      background-color: #e6f7e6;
      color: #28a745;
    }

    &.pending {
      background-color: #fff3cd;
      color: #856404;
    }

    &.fulfilled {
      background-color: #d4edda;
      color: #155724;
    }

    &.unfulfilled,
    &.none {
      background-color: #f8f9fa;
      color: #6c757d;
    }
  }

  .address-sections {
    display: flex;
    gap: 24px;

    @media screen and (max-width: 768px) {
      flex-direction: column;
    }

    .address-section {
      flex: 1;
    }
  }

  .order-items-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 10px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    th {
      text-align: left;
      color: #666;
      font-weight: 500;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .product-name {
      font-weight: 500;
    }

    .product-variant {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
  }

  .price-summary {
    max-width: 400px;
    margin-left: auto;

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;

      &:not(:last-child) {
        border-bottom: 1px solid #eee;
      }

      &.total {
        font-weight: 600;
        font-size: 16px;
        border-top: 2px solid #eee;
        margin-top: 8px;
        padding-top: 16px;
      }
    }

    .discount {
      color: #28a745;
    }
  }
</style>
