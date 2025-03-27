<!-- 老订单弹窗 -->

<script lang="ts">
  // 导入必要的依赖
  import { createEventDispatcher } from "svelte";

  // 定义属性
  export let order: any;
  export let onClose: () => void;

  // i18n文本对象 - 设置为可选，使用部分类型
  export let i18n: Record<string, string> = {
    "account.order": "Order",
    "account.product": "Product",
    "account.sku": "SKU",
    "account.price": "Price",
    "account.quantity": "Qty",
    "account.total": "Total",
    "account.subtotal": "Subtotal",
    "account.discount": "Discount",
    "account.shipping": "Shipping",
    "account.billing_address": "Billing Address",
    "account.payment_status": "Payment Status",
    "account.unpaid": "Unpaid",
    "account.shipping_address": "Shipping Address",
    "account.fulfillment_status": "Fulfillment Status",
    "account.unfulfilled": "Unfulfilled",
    "account.fulfilled": "Fulfilled",
  };

  // 创建事件分发器
  const dispatch = createEventDispatcher();

  // 计算各项值
  $: items = order?.line_items || [];
  $: order_id = order?.ID || "";
  $: created_at = order?.post_date || "";
  $: order_subtotal = items.reduce(
    (total: number, item: any) => total + parseFloat(item.line_subtotal || 0),
    0,
  );
  $: discount_cart = parseFloat(order?.discount_total || 0);
  $: cost = parseFloat(order?.order_shipping || 0);
  $: order_total = parseFloat(order?.order_total || 0);
  $: financial_status = order?.financial_status || "unpaid";
  $: fulfillment_status = order?.fulfillment_status || "unfulfilled";

  // 检查是否为移动设备
  function isMobile() {
    if (typeof window !== "undefined") {
      return !!navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
      );
    }
    return false;
  }

  // 翻译函数，模拟Vue的$t函数
  function t(key: string): string {
    return i18n[key] || key;
  }

  // 关闭弹窗
  function closeModal() {
    if (onClose) onClose();
    dispatch("close");
  }

  // 键盘事件处理
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-overlay" on:click|self={closeModal}>
  <div class="modal-content">
    <button class="close-button" on:click={closeModal}>×</button>

    {#if order}
      <div class="orderpage container row">
        <div class="col-md-4 col-12 order_msg">
          <!-- 移动端显示的商品列表 -->
          <div class="order_products d-block d-md-none">
            {#each items as item (item.order_item_id)}
              <div class="order_product">
                <!-- 商品名 -->
                <div class="order_product__name">
                  <span class="order_product__name__title">
                    <i class="page_text_font">{t("account.product")}</i>
                  </span>
                  <span class="page_text_font">
                    <a
                      class="page_text_font_msg"
                      href={`/search?q=${item.order_item_name}`}
                    >
                      {item.order_item_name}
                    </a>
                  </span>
                </div>
                <!-- sku -->
                <div class="order_product__sku">
                  <span class="text-uppercase">
                    <i class="page_text_font">{t("account.sku")}</i>
                  </span>
                  <span class="page_text_font">
                    <i class="page_text_font_msg">{item.sku || "--"}</i>
                  </span>
                </div>
                <!-- 价格 -->
                <div class="order_product__price">
                  <span>
                    <i class="page_text_font">{t("account.price")}</i>
                  </span>
                  <span class="page_text_font page_text_font_msg">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                <!-- 数量 -->
                <div class="order_product__quantity">
                  <span>
                    <i class="page_text_font">{t("account.quantity")}</i>
                  </span>
                  <span class="page_text_font">
                    <i class="page_text_font_msg">{item.qty}</i>
                  </span>
                </div>
                <!-- 总价 -->
                <div class="order_product__total">
                  <span>
                    <i class="page_text_font">{t("account.total")}</i>
                  </span>
                  <span class="page_text_font page_text_font_msg">
                    ${parseFloat(item.line_subtotal).toFixed(2)}
                  </span>
                </div>
              </div>
            {/each}
          </div>

          <div class="order_total">
            <!-- 折扣前商品总价 -->
            <div class="order_total__subtotal">
              <span>
                <i class="page_text_font">{t("account.subtotal")}</i>
              </span>
              <span>${order_subtotal.toFixed(2)}</span>
            </div>
            <!-- 折扣 -->
            {#if discount_cart > 0}
              <div class="order_total__discount">
                <span>
                  <i class="page_text_font">{t("account.discount")}</i>
                </span>
                <div>
                  <span class="order_total__discount__price">
                    -<span>${discount_cart.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            {/if}
            <!-- 运费 -->
            {#if cost > 0}
              <div class="order_total__fixed">
                <span>
                  <i class="page_text_font">{t("account.shipping")}</i>
                </span>
                <span>${cost.toFixed(2)}</span>
              </div>
            {/if}
            <!-- 订单总价 -->
            <div class="order_total__ordertotal">
              <span>
                <i class="secondary_title">{t("account.total")}</i>
              </span>
              <span>${order_total.toFixed(2)}</span>
            </div>
          </div>

          <div class="order_address">
            {#if order.billing_address}
              <div class="billing_address_msg">
                <h4 class="title">{t("account.billing_address")}</h4>
                <p class="status">
                  <strong>{t("account.payment_status")}:</strong>
                  <span class="page_text_font">
                    {financial_status === "waiting"
                      ? t("account.unpaid")
                      : financial_status}
                  </span>
                </p>
                <p class="page_text_font">
                  {order.billing_address.first_name}
                  {order.billing_address.last_name}
                  <br />
                  {order.billing_address.address_1}
                  {order.billing_address.address_2}
                  {order.billing_address.city}
                  <br />
                  {order.billing_address.postcode}
                  <span>{order.billing_address.state}</span>
                  <br />
                  {order.billing_address.country}
                </p>
              </div>
            {/if}

            {#if order.shipping_address}
              <div class="shipping_address_msg">
                <h4 class="title">{t("account.shipping_address")}</h4>
                <p class="status">
                  <strong>{t("account.fulfillment_status")}:</strong>
                  <span class="page_text_font">
                    {fulfillment_status === "unfulfilled"
                      ? t("account.unfulfilled")
                      : fulfillment_status === "fulfilled"
                        ? t("account.fulfilled")
                        : fulfillment_status}
                  </span>
                </p>
                <p class="page_text_font">
                  {order.shipping_address.first_name}
                  {order.shipping_address.last_name}
                  <br />
                  {order.shipping_address.address_1}
                  {order.shipping_address.address_2}
                  {order.shipping_address.city}
                  <br />
                  {order.shipping_address.postcode}
                  <span>{order.shipping_address.state}</span>
                  <br />
                  {order.shipping_address.country}
                </p>
              </div>
            {/if}
          </div>
        </div>

        <div class="col-md-8 col-12 order_details">
          <div class="title">
            <h4 class="order_id">{t("account.order")} #{order_id}</h4>
            <p class="time">{created_at}</p>
          </div>
          <table class="table order_table d-none d-md-block">
            <thead>
              <tr>
                <th style={isMobile() ? "width: 22%" : "auto"}>
                  {t("account.product")}
                </th>
                <th class="text-uppercase">{t("account.sku")}</th>
                <th style={isMobile() ? "width: 18%" : "auto"}>
                  {t("account.price")}
                </th>
                <th style={isMobile() ? "width: 22%" : "auto"}>
                  {t("account.quantity")}
                </th>
                <th style={isMobile() ? "width: 18%" : "auto"}>
                  {t("account.total")}
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- 商品 -->
              {#each items as item (item.order_item_id)}
                <tr class="product">
                  <td>
                    <a
                      class="page_text_font"
                      href={`/search?q=${item.order_item_name}`}
                    >
                      {item.order_item_name}
                    </a>
                  </td>
                  <td class="page_text_font">
                    <i>{item.sku || "--"}</i>
                  </td>
                  <td class="price secondary_title">
                    ${parseFloat(item.price).toFixed(2)}
                  </td>
                  <td class="secondary_title" style="text-align: center">
                    <i>{item.qty}</i>
                  </td>
                  <td class="total secondary_title">
                    ${parseFloat(item.line_subtotal).toFixed(2)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background-color: white;
    border-radius: 4px;
    padding: 20px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: none;
    font-size: 24px;
    cursor: pointer;
    z-index: 10;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
  }

  .col-12 {
    position: relative;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    flex: 0 0 100%;
    max-width: 100%;
  }

  .col-md-4 {
    position: relative;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;

    @media (min-width: 768px) {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }
  }

  .col-md-8 {
    position: relative;
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;

    @media (min-width: 768px) {
      flex: 0 0 66.666667%;
      max-width: 66.666667%;
    }
  }

  .d-block {
    display: block;
  }

  .d-none {
    display: none;
  }

  @media (min-width: 768px) {
    .d-md-none {
      display: none;
    }
    .d-md-block {
      display: block;
    }
  }

  .text-uppercase {
    text-transform: uppercase;
  }

  .orderpage {
    padding: 0;
    padding-top: 50px;
    .order_msg {
      padding: 0;
      padding-right: 50px;
      border-right: 1px solid #cccccc;
      .order_products {
        margin-bottom: 30px;
        .order_product {
          background: #f7f7f9;
          padding: 12px 14px;
          margin-bottom: 1px;
          display: flex;
          flex-direction: column;
          font-style: normal;
          &__name,
          &__sku,
          &__price,
          &__quantity,
          &__total {
            margin: 10px 0px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            &__title {
              white-space: nowrap;
            }
            .page_text_font_msg {
              color: #595959;
              font-size: 14px;
              font-family: Roboto;
              font-weight: 400;
              font-style: normal;
            }
            .page_text_font {
              font-size: 14px;
              font-family: Roboto;
              font-weight: 400;
              color: #000000;
              font-style: normal;
            }
          }
          &__name {
            span.page_text_font {
              text-align: right;
            }
          }
        }
      }
      .order_total {
        background: #f7f7f9;
        padding: 15px 30px;
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
        font-style: normal;
        &__subtotal,
        &__discount,
        &__fixed,
        &__ordertotal {
          margin: 10px 0px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          .page_text_font {
            font-size: 20px;
            font-family: Roboto;
            font-weight: 400;
            color: #222a40;
            font-style: normal;
          }
          &__label {
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
          }
        }
        &__discount {
          div {
            display: flex;
            flex-direction: column;
            span {
              margin: 3px 0px;
              .page_text_font {
                font-size: 16px;
                font-family: Roboto;
                font-weight: 400;
                color: #8694a1;
                font-style: normal;
              }
            }
          }
          &__price {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-family: Roboto;
            font-weight: 400;
            color: #8694a1;
            font-style: normal;
          }
        }
        &__ordertotal {
          .secondary_title {
            font-family: Roboto;
            color: #222a40;
            font-size: 20px;
            font-weight: bold;
            font-style: normal;
          }
        }
      }
      .order_address {
        background: #f7f7f9;
        padding: 15px 30px;
        text-align: left;
        .billing_address_msg,
        .shipping_address_msg {
          margin: 15px 0px;
          .title,
          .status {
            font-family: Roboto;
            color: #222a40;
          }
          .title {
            font-size: 20px;
            font-weight: 500;
            line-height: 42px;
          }
          .status {
            font-size: 16px;
            font-weight: 500;
            line-height: 42px;
          }
          .page_text_font {
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
          }
        }
      }
    }
    .order_details {
      padding-left: 50px;
      .title {
        display: flex;
        margin-bottom: 45px;
        .order_id {
          font-size: 20px;
          font-family: Roboto;
          font-weight: 400;
          color: #222a40;
        }
        .time {
          font-size: 14px;
          font-family: Roboto;
          font-weight: 300;
          color: #666666;
          line-height: 30px;
          margin-left: 20px;
        }
      }
      .order_table {
        thead {
          background-color: #f7f6fb;
          tr {
            th {
              text-align: left;
              height: 11px;
              font-size: 14px;
              font-family: Roboto;
              font-weight: 500;
              line-height: 42px;
              color: #222a40;
              padding: 8px;
            }
          }
        }
        tbody {
          & > tr {
            border-bottom: 1px solid #c3c3c3;
            td {
              word-wrap: normal;
              text-align: left;
              vertical-align: middle;
              height: 14px;
              font-size: 14px;
              font-family: Roboto;
              font-weight: 400;
              color: #222a40;
              line-height: 42px;
              padding: 8px;
              i {
                font-style: normal;
                a {
                  text-decoration: underline;
                }
              }
            }
          }
        }
      }
    }
  }

  .secondary_title {
    font-size: 16px;
    font-weight: 600;
    color: #222a40;
  }

  .page_text_font {
    font-size: 14px;
    color: #666;
    font-style: normal;
  }

  i {
    font-style: normal;
  }

  @media screen and (max-width: 768px) {
    .container {
      padding: 0 !important;
    }
    .orderpage {
      padding-top: 20px !important;
      margin: 0;
      .order_msg {
        order: 2;
        padding-left: 15px !important;
        padding-right: 15px !important;
        border: none !important;
        .order_total,
        .order_address {
          padding: 12px 14px !important;
          .page_text_font {
            font-size: 15px !important;
          }
        }
      }
      .order_details {
        padding: 0 !important;
        order: 1;
        .title {
          margin: 0 15px 25px !important;
        }
        .order_table {
          width: 100%;
          display: table;
          overflow: auto;
          thead {
            tr {
              word-wrap: normal;
              th {
                padding: 17px 8px !important;
                height: 10px !important;
                font-size: 13px !important;
                line-height: 21px !important;
              }
              th:first-child {
                padding-left: 15px !important;
                padding-right: 8px !important;
              }
              th:last-child {
                padding-left: 8px !important;
                padding-right: 15px !important;
              }
            }
          }
          tbody {
            tr {
              td {
                padding: 17px 8px !important;
                height: 24px !important;
                font-size: 13px !important;
                line-height: 15px !important;
              }
              td:first-child {
                padding-left: 15px !important;
                padding-right: 8px !important;
              }
              td:last-child {
                padding-left: 8px !important;
                padding-right: 15px !important;
              }
            }
            & > tr:last-child {
              border-bottom: 1px solid #c3c3c3 !important;
            }
          }
        }
      }
    }
  }
</style>
